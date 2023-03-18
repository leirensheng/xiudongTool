#SingleInstance, Force
SendMode Input
SetWorkingDir, %A_ScriptDir%

WinActivate, ahk_exe electron.exe
click 800 800
send ^c
send ^c