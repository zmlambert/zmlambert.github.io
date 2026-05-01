---
layout: post
title:  "hackthebox labs: rev_simpleencryptor"
date:   2026-05-01
tags: re c hackthebox htb labs very_easy
toc: true
---

# challenge

>On our regular checkups of our secret flag storage server we found out that we were hit by ransomware! The original flag data is nowhere to be found, but luckily we not only have the encrypted file but also the encryption program itself.


the challenge presents us with an ELF `encrypt`:

{% highlight text desc="file encrypt" wrap %}
encrypt: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=0bddc0a794eca6f6e2e9dac0b6190b62f07c4c75, for GNU/Linux 3.2.0, not stripped
{% endhighlight %}

and also a `flag.enc` file, which is the flag output in its "encrypted" format. it's a bunch of bytes:

{% highlight hex desc="xxd flag.enc"%}
00000000: 5a35 b162 00f5 3e12 c0bd 8d16 f0fd 7599  Z5.b..>.......u.
00000010: faef 399a 4b96 21a1 4316 2371 65fb 274b  ..9.K.!.C.#qe.'K
{% endhighlight %}

running the binary segfaults. might be nixos, i dont know...

# solution

i won't even bother analyzing the asm for an "encryption" binary. ill just open it in ghidra.

there isn't any encrypt function, just a main and an output.

{% highlight c mark_lines="16 35 36" desc="encrypt decomp" collapsed %}
undefined8 main(void)
{
    int iVar1;
    time_t tVar2;
    long in_FS_OFFSET;
    uint local_40;
    uint local_3c;
    long local_38;
    FILE *local_30;
    size_t local_28;
    void *local_20;
    FILE *local_18;
    long local_10;
    
    local_10 = *(long *)(in_FS_OFFSET + 0x28);
    local_30 = fopen("flag","rb");
    fseek(local_30,0,2);
    local_28 = ftell(local_30);
    fseek(local_30,0,0);
    local_20 = malloc(local_28);
    fread(local_20,local_28,1,local_30);
    fclose(local_30);
    tVar2 = time((time_t *)0x0);
    local_40 = (uint)tVar2;
    srand(local_40);
    for (local_38 = 0; local_38 < (long)local_28; local_38 = local_38 + 1) {
         iVar1 = rand();
         *(byte *)((long)local_20 + local_38) = *(byte *)((long)local_20 + local_38) ^ (byte)iVar1;
         local_3c = rand();
         local_3c = local_3c & 7;
         *(byte *)((long)local_20 + local_38) =
                    *(byte *)((long)local_20 + local_38) << (sbyte)local_3c |
                    *(byte *)((long)local_20 + local_38) >> 8 - (sbyte)local_3c;
    }
    local_18 = fopen("flag.enc","wb");
    fwrite(&local_40,1,4,local_18);
    fwrite(local_20,1,local_28,local_18);
    fclose(local_18);
    if (local_10 != *(long *)(in_FS_OFFSET + 0x28)) {
                                             /* WARNING: Subroutine does not return */
         __stack_chk_fail();
    }
    return 0;
}
{% endhighlight %}

looking at the code now, i understand why it segfaults: it's trying to read `flag` but that file doesn't exist next to the binary.

creating it allows it to run. i did a couple tests:

1. encrypting `"A" * 2000` does not result in any obvious patterns
2. encrypting the same ciphertext produces different results

well, i guess ill have to analyze the algorithm.

## simplifying decomp output

ill go ahead and rename some obvious variables using ghidra:

{% highlight c desc="simplified encrypt decomp" collapsed %}
int main(void)
{
    int r;
    time_t time_NULL;
    long in_FS_OFFSET;
    uint time_uint;
    uint r2;
    long i;
    FILE *flag_file;
    size_t num_chars;
    void *buf;
    FILE *flag_enc_file;
    long stack_check_bullshit_ignore;
    
    stack_check_bullshit_ignore = *(long *)(in_FS_OFFSET + 0x28);
    flag_file = fopen("flag","rb");
                                             /* seek to end of file */
    fseek(flag_file,0,2);
    num_chars = ftell(flag_file);
                                             /* seek to beginning of file */
    fseek(flag_file,0,0);
    buf = malloc(num_chars);
    fread(buf,num_chars,1,flag_file);
    fclose(flag_file);
    time_NULL = time((time_t *)0x0);
    time_uint = (uint)time_NULL;
    srand(time_uint);
    for (i = 0; i < (long)num_chars; i = i + 1) {
         r = rand();
         *(byte *)((long)buf + i) = *(byte *)((long)buf + i) ^ (byte)r;
         r2 = rand();
         r2 = r2 & 7;
         *(byte *)((long)buf + i) =
                    *(byte *)((long)buf + i) << (sbyte)r2 | *(byte *)((long)buf + i) >> 8 - (sbyte)r2;
    }
    flag_enc_file = fopen("flag.enc","wb");
    fwrite(&time_uint,1,4,flag_enc_file);
    fwrite(buf,1,num_chars,flag_enc_file);
    fclose(flag_enc_file);
                                             /* ignore bullshit below */
    if (stack_check_bullshit_ignore != *(long *)(in_FS_OFFSET + 0x28)) {
                                             /* WARNING: Subroutine does not return */
         __stack_chk_fail();
    }
    return 0;
}
{% endhighlight %}

so basically...

1. opens the file
2. counts number of characters
3. loops through each character of the file and transforms it
4. writes out

yeah, fair enough.

so the only hangup we have is that it calls `srand(time(NULL));` which seeds random with the current epoch time in seconds.

well, it would be a hangup... but it writes 4 bytes to the file, which happens to be exactly the size of an epoch time, to `flag.enc`. this means we know what the seed was.

## actual solution

### the correct timestamp

as mentioned...

{% highlight hex desc="xxd flag.enc"%}
00000000: 5a35 b162 00f5 3e12 c0bd 8d16 f0fd 7599  Z5.b..>.......u.
00000010: faef 399a 4b96 21a1 4316 2371 65fb 274b  ..9.K.!.C.#qe.'K
{% endhighlight %}

the correct timestamp is `0x5a35b162` or `1513468258` in decimal, which is *Sat Dec 16 23:50:58 2017 UTC*.

### reverse algorithm

there was a lot of pain involved in translating ghidra decomp to a replicable C source, specifically involving `sbyte` vs `byte`... turns out, it's `signed char` and `unsigned char`. who knew! (not me)

also apparently `char` isnt the same as `unsigned char` or `signed char` because `char` [depends on the compiler](https://www.gnu.org/software/c-intro-and-ref/manual/html_node/Signed-and-Unsigned-Types.html).

what the hell man!!!!!!!!!

anyway, i fully translated the algorithm into something actually readable:

{% highlight c desc="encrypt.c" collapsed %}
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main(void)
{
    FILE *flag_file = fopen("flag","rb");
    fseek(flag_file,0,SEEK_END);
    size_t num_chars = ftell(flag_file); // file length in chars, including \0
    fseek(flag_file,0,SEEK_SET);

    unsigned char *buf = malloc(num_chars);
    int _ = fread(buf,num_chars,1,flag_file);
    fclose(flag_file);
    unsigned int timestamp = time(NULL);
    srand(timestamp);

    for (int i = 0; i < num_chars; i++) {
         unsigned char r = rand();
         buf[i] = buf[i] ^ r;
         signed char r2 = rand();
         r2 = r2 & 7;
         // split up because it's easier to visualize
         // buf[i] = buf[i] << r2 | buf[i] >> 8 - r2;
         int val = 8 - r2;
         int val2 = buf[i] >> val;

         buf[i] = buf[i] << r2; 
         buf[i] = buf[i] | val2;
    }

    FILE *flag_enc_file = fopen("flag_test.enc","wb");
    fwrite(&timestamp,1,4,flag_enc_file);
    fwrite(buf,1,num_chars,flag_enc_file);
    fclose(flag_enc_file);
    
    return 0;
}
{% endhighlight %}

now it's as simple as writing a C program to reverse the algorithm.

{% highlight c desc="solve.c" collapsed %}
#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main(void)
{
    FILE *flag_file = fopen("flag.enc","rb");
    fseek(flag_file,0,SEEK_END);
    size_t num_chars = ftell(flag_file); // file length in chars, including \0
    fseek(flag_file,0,SEEK_SET);
 
    unsigned char *buf = malloc(num_chars);
    int _ = fread(buf,num_chars,1,flag_file);
    fclose(flag_file);
    // extract timestamp from first 4 bytes of encrypted flag (little-endian order)
    unsigned int timestamp = buf[0] +
                             (buf[1] << 8) +
                             (buf[2] << 16) +
                             (buf[3] << 24);
    // seed random with that timestamp
    srand(timestamp);
    // for each character in buffer length starting at 4 (the beginning of the actual flag)
    for (int i = 4; i < num_chars; i++) {
         unsigned char r = rand();
         signed char r2 = rand();
         r2 = r2 & 7; 

         int val = 8 - r2;        // stays the same
         int val2 = buf[i] >> r2; // shift by r2 instead
         buf[i] = buf[i] << val;  // shift by val instead
         buf[i] = buf[i] | val2;  // same or
         buf[i] = buf[i] ^ r;     // XOR at end
    }
  
    FILE *flag_enc_file = fopen("flag.txt","wb");
    fwrite(&buf[4],1,num_chars-4,flag_enc_file);  // start writing from buf[4] for num_chars-4 because that's the flag and its length.
    fclose(flag_enc_file);
    
    return 0;
}
{% endhighlight %}

and when i run it...

{% highlight text desc="running solver" %}
user@htb ~/Documents/HTB/rev_simpleencryptor $ xxd flag.enc
00000000: 5a35 b162 00f5 3e12 c0bd 8d16 f0fd 7599  Z5.b..>.......u.
00000010: faef 399a 4b96 21a1 4316 2371 65fb 274b  ..9.K.!.C.#qe.'K
user@htb ~/Documents/HTB/rev_simpleencryptor $ gcc solve.c -osolve
user@htb ~/Documents/HTB/rev_simpleencryptor $ ./solve     
user@htb ~/Documents/HTB/rev_simpleencryptor $ cat flag.txt         
HTB{vRy_s1MplE_F1LE3nCryp0r}%                  
{% endhighlight %}
# lessons learned

1. `sbyte` and `byte` in ghidra are `signed char` and `unsigned char`
2. `unsigned char` is not `char`
3. creating an unsigned integer from bytes is as simple as adding bytes together, just shifting them into place. interesting.
4. bitwise-or `|` is lossy, except it can actually be used to concatenate bytes together in a lossless way... weird!
5. i love C
