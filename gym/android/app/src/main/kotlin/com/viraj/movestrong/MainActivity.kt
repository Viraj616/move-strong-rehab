package com.viraj.movestrong

import io.flutter.embedding.android.FlutterActivity

import android.app.*
import android.content.*
import android.os.Build
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.util.Calendar

class MainActivity : FlutterActivity() {
    private var exportResult: MethodChannel.Result? = null
    private var exportText: String? = null
    override fun configureFlutterEngine(engine: FlutterEngine) {
        super.configureFlutterEngine(engine)
        AppUpdates(this).register(engine)
        MethodChannel(engine.dartExecutor.binaryMessenger,"move_strong/backup").setMethodCallHandler { call, result ->
            if(call.method !in listOf("export","restore")){ result.notImplemented(); return@setMethodCallHandler }
            if(exportResult != null){ result.error("busy","Another export is open",null); return@setMethodCallHandler }
            exportResult=result
            if(call.method=="restore"){
                startActivityForResult(Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE);type="application/json"
                },712)
                return@setMethodCallHandler
            }
            exportText=call.arguments as String
            startActivityForResult(Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
                addCategory(Intent.CATEGORY_OPENABLE)
                type="application/json"
                putExtra(Intent.EXTRA_TITLE,"move-strong-backup-"+System.currentTimeMillis()+".json")
            }, 711)
        }
        MethodChannel(engine.dartExecutor.binaryMessenger,"move_strong/reminder").setMethodCallHandler { call, result ->
            if(call.method != "schedule") { result.notImplemented(); return@setMethodCallHandler }
            val minutes = call.arguments as Int
            if (minutes >= 0 && Build.VERSION.SDK_INT >= 33)
                requestPermissions(arrayOf(android.Manifest.permission.POST_NOTIFICATIONS),42)
            WorkoutReminder.schedule(this,minutes)
            result.success(null)
        }
    }
    override fun onActivityResult(requestCode:Int,resultCode:Int,data:Intent?){
        super.onActivityResult(requestCode,resultCode,data)
        if(requestCode!=711 && requestCode!=712)return
        val reply=exportResult ?: return
        try {
            val uri=data?.data
            if(resultCode!=RESULT_OK || uri==null){reply.success(false);return}
            if(requestCode==712){
                val stream=contentResolver.openInputStream(uri) ?: error("Cannot read backup")
                reply.success(stream.bufferedReader(Charsets.UTF_8).use { it.readText() })
                return
            }
            val stream=contentResolver.openOutputStream(uri,"wt") ?: error("Cannot open backup destination")
            stream.bufferedWriter(Charsets.UTF_8).use { it.write(requireNotNull(exportText)) }
            reply.success(true)
        }catch(e:Exception){reply.error("backup_failed",e.localizedMessage,null)}
        finally{exportResult=null;exportText=null}
    }
}

class WorkoutReminder : BroadcastReceiver() {
    companion object {
        fun schedule(context: Context, minutes: Int) {
            val alarm=context.getSystemService(AlarmManager::class.java)
            val intent=Intent(context,WorkoutReminder::class.java).putExtra("minutes",minutes)
            val token=PendingIntent.getBroadcast(context,42,intent,PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
            alarm.cancel(token)
            if(minutes !in 0..1439)return
            val next=Calendar.getInstance().apply { set(Calendar.HOUR_OF_DAY,minutes/60);set(Calendar.MINUTE,minutes%60);set(Calendar.SECOND,0) }
            while(next.timeInMillis<=System.currentTimeMillis() || next.get(Calendar.DAY_OF_WEEK)==Calendar.SUNDAY) next.add(Calendar.DATE,1)
            alarm.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,next.timeInMillis,token)
        }
    }
    override fun onReceive(context: Context,intent:Intent) {
        val manager=context.getSystemService(NotificationManager::class.java)
        val channel="workout"
        val builder=if(Build.VERSION.SDK_INT>=26){
            manager.createNotificationChannel(NotificationChannel(channel,"Workout",NotificationManager.IMPORTANCE_DEFAULT))
            Notification.Builder(context,channel)
        }else Notification.Builder(context)
        val open=PendingIntent.getActivity(context,43,Intent(context,MainActivity::class.java),PendingIntent.FLAG_IMMUTABLE)
        manager.notify(42,builder.setSmallIcon(android.R.drawable.ic_dialog_info).setContentTitle("Today's workout").setContentText("Open your training plan").setContentIntent(open).setAutoCancel(true).build())
        schedule(context,intent.getIntExtra("minutes",-1))
    }
}
