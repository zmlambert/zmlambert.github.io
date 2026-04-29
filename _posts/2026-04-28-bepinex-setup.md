---
layout: post
title:  "BepInEx plugin development with jetbrains rider"
date:   2026-04-28
tags: bepinex rider unity modding csharp
toc: true
---

# getting started

this guide is something i wrote myself to jumpstart creation of unity game mods using BepInEx. i primarily use linux, so this guide will be tailored to that. most things will work fine in Windows, but i do use a couple CLI utilities that aren't available on Windows by default.

**prerequisites**:
- unity game
- dotnet command line.
- jetbrains rider
- your favorite .NET decompiler
  - [dnSpyEx](https://github.com/dnSpyEx/dnSpy)
  - [ilspy-vscode](https://marketplace.visualstudio.com/items?itemName=icsharpcode.ilspy-vscode)

## download

grab a release from [here](https://github.com/BepInEx/BepInEx/releases). at the time of writing, BepInEx v6 is in pre-release, and v5 is LTS. i am going to use a v6 release.

the release you choose **depends on your game's platform**, not your own. and be mindful of `x86` vs. `x64` releases.

## drop files game

place the release files next to your game's exe file. for example, i will be using *BABBDI*. i highlighted the files from BepInEx.

{% highlight console mark_lines="3 4 5 6 10" %}
drwxr-xr-x 6 user user 4.0K Apr 28 17:55 Babbdi_Data
-rwxr-xr-x 1 user user 651K Apr 28 17:55 Babbdi.exe
drwxr-xr-x 3 user user 4.0K Apr 28 17:58 BepInEx
-rw-r--r-- 1 user user  338 Feb  8 01:58 changelog.txt
-rw-r--r-- 1 user user 1.5K Feb  8 01:50 doorstop_config.ini
-rw-r--r-- 1 user user    5 Feb  8 01:58 .doorstop_version
drwxr-xr-x 4 user user 4.0K Apr 28 17:55 MonoBleedingEdge
-rwxr-xr-x 1 user user 1.1M Apr 28 17:55 UnityCrashHandler64.exe
-rwxr-xr-x 1 user user  28M Apr 28 17:55 UnityPlayer.dll
-rw-r--r-- 1 user user  26K Feb  8 01:58 winhttp.dll
{% endhighlight %}

and inside the `BepInEx` folder is the `core` folder which contains... BepInEx's core files

>if you are using linux and modding a windows game, don't forget to add a wine dll override for `winhttp.dll`, something like `WINEDLLOVERRIDES="winhttp=n,b"`

## start game

launch the game. you will see the `BepInEx` folder populate!

{% highlight console %}
drwxr-xr-x 2 user user 4.0K Apr 28 18:11 cache
drwxr-xr-x 2 user user 4.0K Apr 28 18:11 config
drwxr-xr-x 2 user user 4.0K Apr 28 17:58 core
-rw-r--r-- 1 user user  750 Apr 28 18:11 LogOutput.log
drwxr-xr-x 2 user user 4.0K Apr 28 18:11 patchers
drwxr-xr-x 2 user user 4.0K Apr 28 18:11 plugins
{% endhighlight %}

you can close the game at this point.

> if you only see `core`, the game is either *il2cpp* or *not loading winhttp.dll*

## enable console logging

i recommend enabling logging to console. you can technically skip it, but console outputs make things so much easier to debug when developing your plugin.

edit `BepInEx/config/BepInEx.cfg` and make sure the highlighted line is set to `true`:

{% highlight ini mark_lines="6" %}
[Logging.Console]

## Enables showing a console for log output.
# Setting type: Boolean
# Default value: false
Enabled = true
{% endhighlight %}

# mod template

it's finally time to set up a mod template. the idea is to run this command:

>`dotnet new <template> -n <name> -T <TFW> -U <version>`

and to do this, you need to get

1. `<template>`: BepInEx template "Short Name"
2. `<name>`: the name of your plugin
3. `<TFW>`: .NET target framework
4. `<version>`: version of Unity the game uses

## `template` - download & choose

i will be using the bleeding edge templates. i haven't had luck with the normal ones:

>`dotnet new install BepInEx.Templates::2.0.0-be.4 --nuget-source https://nuget.bepinex.dev/v3/index.json`

you can verify with `dotnet new list bepinex`:

{% highlight text %}
These templates matched your input: 'bepinex'

Template Name                    Short Name               Language  Tags
-------------------------------  -----------------------  --------  ------------------------------------------
BepInEx 5 Plugin                 bepinex5plugin           [C#]      BepInEx/BepInEx 5/Plugin
BepInEx 6 .NET Core Plugin       bep6plugin_coreclr       [C#]      BepInEx/BepInEx 6/Plugin/CoreCLR/.NET Core
BepInEx 6 .NET Framework Plugin  bep6plugin_netfx         [C#]      BepInEx/BepInEx 6/Plugin/.NET Framework
BepInEx 6 Unity Il2Cpp Plugin    bep6plugin_unity_il2cpp  [C#]      BepInEx/BepInEx 6/Plugin/Unity/Il2Cpp
BepInEx 6 Unity Mono Plugin      bep6plugin_unity_mono    [C#]      BepInEx/BepInEx 6/Plugin/Unity/Mono
{% endhighlight %}

>*take note of the short name for your BepInEx version* - in this case, `bep6plugin_unity_mono` is what i will be using

## `TFW` - .NET Target Framework

navigate to the `game_Data/Managed/` and look for *one* of these dlls in this order:

1. `netstandard.dll`
2. `mscorlib.dll`

>`game_Data` would be `BABBDI_Data` in my case

you only need one of them.

### `netstandard.dll`

look for a `netstandard.dll` and open it with your .NET decompiler. you are looking for something that indicates the version, e.g.:

>![netstandard 2.1.0.0 in assembly list](/assets/images/posts/bepinex-setup/netstandard1.png)

or

>![netstandard 2.1.0.0 in comment](/assets/images/posts/bepinex-setup/netstandard2.png)

in my case, the TFW is `netstandard2.1`. you'll see a pattern `netstandard#.#` with these.

### `mscorlib.dll`

lok at the same places and you'll probably see `4.0.0.0`. so your TFW is `net4.6` 


### none of the above

if you can't find that, just use `net35` and hope that's good.

## `version` - unity version

there's a very nice command (on linux) that will get you the unity version:

>`cat -v game_Data/globalgamemanagers | grep -Eo '[0-9]+\.[0-9]+\.[A-Za-z0-9]+'`

the output should look something like `2022.3.8f1`. you would use `2022.3.8` for the version in that case

## final command

and time to run the final command

`dotnet new bep6plugin_unitymono -n PluginNameWhateverYouWant -T netstandard2.1 -U 2022.3.8`

you can open the created folder (in this case - `PluginNameWhateverYouWant`) in rider now :)

# adding assemblies to the rider project

## add assemblies

in the solution explorer, right click the c# project file -> *Add* -> *Reference...*

>!["add references" dialog](/assets/images/posts/bepinex-setup/addref1.png)

then click *Add From...*

>!["add from" dialog](/assets/images/posts/bepinex-setup/addref2.png)

navigate to the `BepInEx/core/` directory and add `0Harmony.dll` and `BepInEx.dll`

additionally, add *all* of the following dlls from `game_Data/Managed/` *if they exist*:

- `Assembly-CSharp.dll`
- `Assembly-CSharp-firstpass.dll`
- `UnityEngine.CoreModule.dll`
- `UnityEngine.dll`

then click *OK*.

## fix funny compile error

you will likely encounter build conflicts when you build

![build output with conflict](/assets/images/posts/bepinex-setup/conflict.png)


try editing the csproj file below like so:

>![edit csproj navigation steps](/assets/images/posts/bepinex-setup/fixerror1.png)

and delete the line that includes `BepInEx.Unity.Mono`:

{% highlight xml mark_lines="3" %}
<ItemGroup>
  <PackageReference Include="BepInEx.Analyzers" Version="1.*" PrivateAssets="all" />
  <PackageReference Include="BepInEx.Unity.Mono" Version="6.0.0-be.*" IncludeAssets="compile" />
  <PackageReference Include="BepInEx.PluginInfoProps" Version="2.*" />
  <PackageReference Include="UnityEngine.Modules" Version="2022.3.8" IncludeAssets="compile" />
</ItemGroup>
{% endhighlight %}

make sure you also remove all references to `BepInEx.Unity.Mono`, e.g.

{% highlight cs mark_lines="3" %}
using BepInEx;
using BepInEx.Logging;
using BepInEx.Unity.Mono;
{% endhighlight %}

everything should now build successfully.
