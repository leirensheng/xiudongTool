#SingleInstance, Force
SendMode Input
SetWorkingDir, %A_ScriptDir%

MouseClick, left , 0, -120, 1, 0, , R
send ^c
sleep 600
send ^c