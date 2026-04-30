---
layout: post
title:  "hackthebox labs: rev_spookypass"
date:   2026-04-30
tags: re hackthebox htb labs very_easy
toc: true
---

# challenge

>All the coolest ghosts in town are going to a Haunted Houseparty - can you prove you deserve to get in?

the challenge presents us with an ELF `pass`:

{% highlight text desc="file pass" wrap %}
pass: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=3008217772cc2426c643d69b80a96c715490dd91, for GNU/Linux 4.4.0, not stripped
{% endhighlight %}

and running it we get a password input:

{% highlight text desc="./pass" %}
Welcome to the SPOOKIEST party of the year.
Before we let you in, you'll need to give us the password: password
You're not a real ghost; clear off!
{% endhighlight %}

and getting it wrong pisses the binary off.


# solution

it's literally just `strings`

{% highlight text desc="strings ./pass | grep -A1 -B1 password" %}
[0m party of the year.
Before we let you in, you'll need to give us the password: 
s3cr3t_p455_f0r_gh05t5_4nd_gh0ul5
{% endhighlight %}

let's try that:

{% highlight text desc="./pass" %}
Welcome to the SPOOKIEST party of the year.
Before we let you in, you'll need to give us the password: s3cr3t_p455_f0r_gh05t5_4nd_gh0ul5
Welcome inside!
HTB{un0bfu5c4t3d_5tr1ng5}
{% endhighlight %}

*wow!* complex.

# lessons learned

1. it's a very easy challenge.
