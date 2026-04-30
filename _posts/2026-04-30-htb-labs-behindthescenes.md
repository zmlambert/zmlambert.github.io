---
layout: post
title:  "hackthebox labs: rev_behindthescenes"
date:   2026-04-30
tags: re hackthebox htb labs very_easy
toc: true
---

# challenge

>After struggling to secure our secret strings for a long time, we finally figured out the solution to our problem: Make decompilation harder. It should now be impossible to figure out how our programs work!

the challenge presents us with an ELF `behindthescenes`:

{% highlight text desc="file behindthescenes" wrap %}
behindthescenes: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=e60ae4c886619b869178148afd12d0a5428bfe18, for GNU/Linux 3.2.0, not stripped
{% endhighlight %}

it seemingly needs a password:

{% highlight text desc="./behindthescenes" %}
./challenge <password>
{% endhighlight %}

# solution

there's nothing in the `strings` output that makes any sense, so we need to take a different approach.

i opened the binary with everyone's favorite: gdb (actually pwndbg). let's see what functions the binary uses:

{% highlight asm mark_lines="6 9 11 20" desc="info fun" %}
All defined functions:

Non-debugging symbols:
0x0000000000001000  _init
0x00000000000010b0  __cxa_finalize@plt
0x00000000000010c0  strncmp@plt
0x00000000000010d0  puts@plt
0x00000000000010e0  sigaction@plt
0x00000000000010f0  strlen@plt
0x0000000000001100  __stack_chk_fail@plt
0x0000000000001110  printf@plt
0x0000000000001120  memset@plt
0x0000000000001130  sigemptyset@plt
0x0000000000001140  _start
0x0000000000001170  deregister_tm_clones
0x00000000000011a0  register_tm_clones
0x00000000000011e0  __do_global_dtors_aux
0x0000000000001220  frame_dummy
0x0000000000001229  segill_sigaction
0x0000000000001261  main
0x0000000000001450  __libc_csu_init
0x00000000000014c0  __libc_csu_fini
0x00000000000014c8  _fini
{% endhighlight %}

nothing that crazy, just a main function and some basic syscalls. time to disassemble:

{% highlight asm mark_lines="42 52 63 74 85" desc="disass main" collapsed %}
Dump of assembler code for function main:
   0x0000000000001261 <+0>:	endbr64
   0x0000000000001265 <+4>:	push   rbp
   0x0000000000001266 <+5>:	mov    rbp,rsp
   0x0000000000001269 <+8>:	sub    rsp,0xb0
   0x0000000000001270 <+15>:	mov    DWORD PTR [rbp-0xa4],edi
   0x0000000000001276 <+21>:	mov    QWORD PTR [rbp-0xb0],rsi
   0x000000000000127d <+28>:	mov    rax,QWORD PTR fs:0x28
   0x0000000000001286 <+37>:	mov    QWORD PTR [rbp-0x8],rax
   0x000000000000128a <+41>:	xor    eax,eax
   0x000000000000128c <+43>:	lea    rax,[rbp-0xa0]
   0x0000000000001293 <+50>:	mov    edx,0x98
   0x0000000000001298 <+55>:	mov    esi,0x0
   0x000000000000129d <+60>:	mov    rdi,rax
   0x00000000000012a0 <+63>:	call   0x1120 <memset@plt>
   0x00000000000012a5 <+68>:	lea    rax,[rbp-0xa0]
   0x00000000000012ac <+75>:	add    rax,0x8
   0x00000000000012b0 <+79>:	mov    rdi,rax
   0x00000000000012b3 <+82>:	call   0x1130 <sigemptyset@plt>
   0x00000000000012b8 <+87>:	lea    rax,[rip+0xffffffffffffff6a]        # 0x1229 <segill_sigaction>
   0x00000000000012bf <+94>:	mov    QWORD PTR [rbp-0xa0],rax
   0x00000000000012c6 <+101>:	mov    DWORD PTR [rbp-0x18],0x4
   0x00000000000012cd <+108>:	lea    rax,[rbp-0xa0]
   0x00000000000012d4 <+115>:	mov    edx,0x0
   0x00000000000012d9 <+120>:	mov    rsi,rax
   0x00000000000012dc <+123>:	mov    edi,0x4
   0x00000000000012e1 <+128>:	call   0x10e0 <sigaction@plt>
   0x00000000000012e6 <+133>:	ud2
   0x00000000000012e8 <+135>:	cmp    DWORD PTR [rbp-0xa4],0x2
   0x00000000000012ef <+142>:	je     0x130b <main+170>
   0x00000000000012f1 <+144>:	ud2
   0x00000000000012f3 <+146>:	lea    rdi,[rip+0xd0a]        # 0x2004
   0x00000000000012fa <+153>:	call   0x10d0 <puts@plt>
   0x00000000000012ff <+158>:	ud2
   0x0000000000001301 <+160>:	mov    eax,0x1
   0x0000000000001306 <+165>:	jmp    0x1439 <main+472>
   0x000000000000130b <+170>:	ud2
   0x000000000000130d <+172>:	mov    rax,QWORD PTR [rbp-0xb0]
   0x0000000000001314 <+179>:	add    rax,0x8
   0x0000000000001318 <+183>:	mov    rax,QWORD PTR [rax]
   0x000000000000131b <+186>:	mov    rdi,rax
   0x000000000000131e <+189>:	call   0x10f0 <strlen@plt>
   0x0000000000001323 <+194>:	cmp    rax,0xc
   0x0000000000001327 <+198>:	jne    0x1432 <main+465>
   0x000000000000132d <+204>:	ud2
   0x000000000000132f <+206>:	mov    rax,QWORD PTR [rbp-0xb0]
   0x0000000000001336 <+213>:	add    rax,0x8
   0x000000000000133a <+217>:	mov    rax,QWORD PTR [rax]
   0x000000000000133d <+220>:	mov    edx,0x3
   0x0000000000001342 <+225>:	lea    rsi,[rip+0xcd2]        # 0x201b
   0x0000000000001349 <+232>:	mov    rdi,rax
   0x000000000000134c <+235>:	call   0x10c0 <strncmp@plt>
   0x0000000000001351 <+240>:	test   eax,eax
   0x0000000000001353 <+242>:	jne    0x1429 <main+456>
   0x0000000000001359 <+248>:	ud2
   0x000000000000135b <+250>:	mov    rax,QWORD PTR [rbp-0xb0]
   0x0000000000001362 <+257>:	add    rax,0x8
   0x0000000000001366 <+261>:	mov    rax,QWORD PTR [rax]
   0x0000000000001369 <+264>:	add    rax,0x3
   0x000000000000136d <+268>:	mov    edx,0x3
   0x0000000000001372 <+273>:	lea    rsi,[rip+0xca6]        # 0x201f
   0x0000000000001379 <+280>:	mov    rdi,rax
   0x000000000000137c <+283>:	call   0x10c0 <strncmp@plt>
   0x0000000000001381 <+288>:	test   eax,eax
   0x0000000000001383 <+290>:	jne    0x1420 <main+447>
   0x0000000000001389 <+296>:	ud2
   0x000000000000138b <+298>:	mov    rax,QWORD PTR [rbp-0xb0]
   0x0000000000001392 <+305>:	add    rax,0x8
   0x0000000000001396 <+309>:	mov    rax,QWORD PTR [rax]
   0x0000000000001399 <+312>:	add    rax,0x6
   0x000000000000139d <+316>:	mov    edx,0x3
   0x00000000000013a2 <+321>:	lea    rsi,[rip+0xc7a]        # 0x2023
   0x00000000000013a9 <+328>:	mov    rdi,rax
   0x00000000000013ac <+331>:	call   0x10c0 <strncmp@plt>
   0x00000000000013b1 <+336>:	test   eax,eax
   0x00000000000013b3 <+338>:	jne    0x1417 <main+438>
   0x00000000000013b5 <+340>:	ud2
   0x00000000000013b7 <+342>:	mov    rax,QWORD PTR [rbp-0xb0]
   0x00000000000013be <+349>:	add    rax,0x8
   0x00000000000013c2 <+353>:	mov    rax,QWORD PTR [rax]
   0x00000000000013c5 <+356>:	add    rax,0x9
   0x00000000000013c9 <+360>:	mov    edx,0x3
   0x00000000000013ce <+365>:	lea    rsi,[rip+0xc52]        # 0x2027
   0x00000000000013d5 <+372>:	mov    rdi,rax
   0x00000000000013d8 <+375>:	call   0x10c0 <strncmp@plt>
   0x00000000000013dd <+380>:	test   eax,eax
   0x00000000000013df <+382>:	jne    0x140e <main+429>
   0x00000000000013e1 <+384>:	ud2
   0x00000000000013e3 <+386>:	mov    rax,QWORD PTR [rbp-0xb0]
   0x00000000000013ea <+393>:	add    rax,0x8
   0x00000000000013ee <+397>:	mov    rax,QWORD PTR [rax]
   0x00000000000013f1 <+400>:	mov    rsi,rax
   0x00000000000013f4 <+403>:	lea    rdi,[rip+0xc30]        # 0x202b
   0x00000000000013fb <+410>:	mov    eax,0x0
   0x0000000000001400 <+415>:	call   0x1110 <printf@plt>
   0x0000000000001405 <+420>:	ud2
   0x0000000000001407 <+422>:	mov    eax,0x0
   0x000000000000140c <+427>:	jmp    0x1439 <main+472>
   0x000000000000140e <+429>:	ud2
   0x0000000000001410 <+431>:	mov    eax,0x0
   0x0000000000001415 <+436>:	jmp    0x1439 <main+472>
   0x0000000000001417 <+438>:	ud2
   0x0000000000001419 <+440>:	mov    eax,0x0
   0x000000000000141e <+445>:	jmp    0x1439 <main+472>
   0x0000000000001420 <+447>:	ud2
   0x0000000000001422 <+449>:	mov    eax,0x0
   0x0000000000001427 <+454>:	jmp    0x1439 <main+472>
   0x0000000000001429 <+456>:	ud2
   0x000000000000142b <+458>:	mov    eax,0x0
   0x0000000000001430 <+463>:	jmp    0x1439 <main+472>
   0x0000000000001432 <+465>:	ud2
   0x0000000000001434 <+467>:	mov    eax,0x0
   0x0000000000001439 <+472>:	mov    rcx,QWORD PTR [rbp-0x8]
   0x000000000000143d <+476>:	xor    rcx,QWORD PTR fs:0x28
   0x0000000000001446 <+485>:	je     0x144d <main+492>
   0x0000000000001448 <+487>:	call   0x1100 <__stack_chk_fail@plt>
   0x000000000000144d <+492>:	leave
   0x000000000000144e <+493>:	ret
End of assembler dump.
{% endhighlight %}

well, they weren't lying about anti-debugging. `ud2` all over wtf! can't have fun in gdb anymore.

but what we can see is a `strlen` and plenty of `strncmp`s, which means it's checking the length of something (probably the input) and also comparing it to some kind of data (probably the password). we know the length of the password is 12 because of the `cmp    rax,0xc` after the `strlen` call, but that's pretty much it.

time for ghidra!

opening the binary in ghidra, going to the `main` function call, then scrolling down to the `strncmp` functions:

![wow, ghidra found it.](/assets/images/posts/htb-labs-behindthescenes/ghidra.png)

{% raw %}`Itz_0nLy_UD2 > HTB{%s}`{% endraw %} looks like a flag to me. let's just try it as a password:

{% highlight text desc="./behindthescenes Itz_0nLy_UD2" %}
> HTB{Itz_0nLy_UD2}
{% endhighlight %}

as expected.

# lessons learned

1. undefined instructions suck!!
2. ghidra wins again
