Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "D:\ai-insight-bot"
WshShell.Run "node src/index.js", 0, False
