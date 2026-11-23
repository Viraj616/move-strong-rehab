package com.example.move_strong

import io.flutter.embedding.android.FlutterActivity

import android.app.*
import android.content.*
import android.os.Build
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import java.util.Calendar

class MainActivity : FlutterActivity() {
    override fun configureFlutterEngine(engine: FlutterEngine) {
        super.configureFlutterEngine(engine)
        MethodChannel(engine.dartExecutor.binaryMessenger,"move_strong/reminder").setMethodCallHandler { call, result ->
            if(call.method != "schedule") { result.notImplemented(); return@setMethodCallHandler }
            val minutes = call.arguments as Int
            if (minutes >= 0 && Build.VERSION.SDK_INT >= 33)
                requestPermissions(arrayOf(android.Manifest.permission.POST_NOTIFICATIONS),42)
            WorkoutReminder.schedule(this,minutes)
            result.success(null)
        }
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
