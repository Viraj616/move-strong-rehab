package com.viraj.movestrong

import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.core.content.FileProvider
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import org.json.JSONObject
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest

class AppUpdates(private val activity: Activity) {
    private val repo = "Viraj616/move-strong-rehab"
    private var offered: Int? = null
    private var busy = false

    private fun connection(url: String) = (URL(url).openConnection() as HttpURLConnection).apply {
        connectTimeout = 15000
        readTimeout = 60000
        setRequestProperty("User-Agent", "MoveStrong-Android")
    }

    @Suppress("DEPRECATION")
    fun register(engine: FlutterEngine) {
        MethodChannel(engine.dartExecutor.binaryMessenger, "move_strong/updates").setMethodCallHandler { call, reply ->
            if (call.method !in listOf("check", "install")) { reply.notImplemented(); return@setMethodCallHandler }
            if (busy) { reply.error("busy","An update is already in progress.",null); return@setMethodCallHandler }
            val install = call.method == "install"
            val version = offered
            if (install && version == null) {reply.error("check","Check for updates again.",null);return@setMethodCallHandler}
            if (install && Build.VERSION.SDK_INT >= 26 && !activity.packageManager.canRequestPackageInstalls()) {
                try {
                    activity.startActivity(Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, Uri.parse("package:"+activity.packageName)))
                    reply.success("permission")
                } catch(e:Exception){reply.error("permission","Allow installation from Move Strong in Android Settings.",null)}
                return@setMethodCallHandler
            }
            busy = true
            Thread {
                try {
                    val pm = activity.packageManager
                    val installed = pm.getPackageInfo(activity.packageName, PackageManager.GET_SIGNATURES)
                    if (!install) {
                        val conn=connection("https://api.github.com/repos/$repo/releases/latest")
                        val release=try {JSONObject(conn.inputStream.bufferedReader().use { it.readText() })}finally{conn.disconnect()}
                        val latest=Regex("gym-android-([0-9]+)").matchEntire(release.getString("tag_name"))?.groupValues?.get(1)?.toInt() ?: error("Unknown release format.")
                        val assets=release.getJSONArray("assets")
                        require((0 until assets.length()).any{assets.getJSONObject(it).getString("name")=="Move-Strong.apk"}){"Release download is unavailable."}
                        activity.runOnUiThread {
                            offered=latest.takeIf { it>installed.versionCode }; busy=false
                            reply.success(offered)
                        }
                    } else {
                        val dir=File(activity.cacheDir,"updates").apply { mkdirs() }
                        val apk=File(dir,"Move-Strong-$version.apk")
                        val conn=connection("https://github.com/$repo/releases/download/gym-android-$version/Move-Strong.apk")
                        try {conn.inputStream.use { input -> apk.outputStream().use { input.copyTo(it) } }}finally{conn.disconnect()}
                        val archive=pm.getPackageArchiveInfo(apk.absolutePath,PackageManager.GET_SIGNATURES) ?: error("Incomplete APK. Try again.")
                        require(archive.packageName==activity.packageName && archive.versionCode==version && archive.versionCode>installed.versionCode){"Unexpected app version."}
                        val signer=archive.signatures?.singleOrNull()?.toByteArray() ?: error("Missing release signature.")
                        val digest=MessageDigest.getInstance("SHA-256").digest(signer).joinToString(""){"%02x".format(it)}
                        require(digest=="ed7c42e42e4e8cac6b50ef60c8569d2135af094823ee16344992c6b3e4672b15" && archive.signatures.contentEquals(installed.signatures)){"APK signing certificate mismatch."}
                        val uri=FileProvider.getUriForFile(activity,activity.packageName+".updates",apk)
                        activity.runOnUiThread {
                            busy=false
                            try {
                                activity.startActivity(Intent(Intent.ACTION_VIEW).setDataAndType(uri,"application/vnd.android.package-archive").addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION))
                                reply.success("installer")
                            }catch(e:Exception){reply.error("installer","Could not open Android installer.",null)}
                        }
                    }
                } catch(e:Exception){activity.runOnUiThread{busy=false;reply.error("update",e.localizedMessage ?: "Update failed.",null)}}
            }.start()
        }
    }
}
