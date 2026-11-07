window.PC32_DATA = {
  psychoMagic: {
    // [50,50] = 5:5. Change to [30,70] or [10,90] for 3:7 or 1:9.
    roomWeights: [50,50],
    rooms: [
      {id:"MANDALA-01",image:"media/images/deep/psycho-magic/dainichi-room-clean-v1.jpg"},
      {id:"FLOWER-02",image:"media/images/deep/psycho-magic/flower-room-01.jpg"}
    ]
  },
  archive: [
    {id:"PC32-C001",code:"PC32",title:"UNTITLED CASSETTE / 01",format:"CASSETTE",genre:"NOISE",year:"N.D.",image:"media/images/archive/cassette/cassette-image-01.jpg",tags:["tape","noise"],depth:0},
    {id:"PC32-C002",code:"PC32",title:"UNTITLED CASSETTE / 02",format:"CASSETTE",genre:"AMBIENT",year:"N.D.",image:"media/images/archive/cassette/cassette-image-06.jpg",tags:["tape","ambient"],depth:0},
    {id:"PC32-C003",code:"PC32",title:"UNTITLED CASSETTE / 03",format:"CASSETTE",genre:"CONCRETE",year:"N.D.",image:"media/images/archive/cassette/cassette-image-01.jpg",tags:["tape","field"],depth:0},
    {id:"MMPD-001",code:"MMPD",title:"MEMOPAD FRAGMENT / 001",format:"DOCUMENT",genre:"COLLAGE",year:"N.D.",image:"media/images/archive/memopad/mmpd-004.jpeg",tags:["memo","print"],depth:0},
    {id:"MMPD-012",code:"MMPD",title:"MEMOPAD FRAGMENT / 012",format:"DOCUMENT",genre:"ABSTRACT",year:"N.D.",image:"media/images/archive/memopad/mmpd-012.jpeg",tags:["memo","private"],depth:1},
    {id:"DEEP-820824",code:"DEEP",title:"UNLISTED SIGNAL / 820824",format:"DATA",genre:"EXPERIMENTAL",year:"—",image:"media/images/backgrounds/bg-hidden-home-01.jpg",tags:["hidden","deeplog"],depth:1},
    {id:"GTLP-AK01",code:"GTLP",title:"AKAGI FIELD INDEX",format:"MOVING IMAGE",genre:"SOUNDTRACK",year:"—",image:"media/images/backgrounds/alone-flower.jpg",tags:["hidden","akagi"],depth:2},
    {id:"BOOT-GN01",code:"BOOT",title:"GENKAKU / PRIVATE RECORD",format:"MOVING IMAGE",genre:"OTHER",year:"—",image:"media/images/backgrounds/flower05.jpg",tags:["hidden","genkaku"],depth:3},
    {id:"DEMO-CT01",code:"DEMO",title:"CUT-IN / MEMORY DEVICE",format:"MOVING IMAGE",genre:"ACTIVE LEARNING",year:"—",image:"media/images/backgrounds/flower04.jpg",tags:["hidden","cutin","memory"],depth:3}
  ],
  goods: [
    {id:"PC32-G001",title:"CASSETTE EDITION / BLACK",category:"CASSETTE",image:"media/images/archive/cassette/cassette-image-04.jpg",depth:0},
    {id:"PC32-G002",title:"CASSETTE EDITION / BLUE",category:"CASSETTE",image:"media/images/archive/cassette/cassette-image-06.jpg",depth:0},
    {id:"PC32-G003",title:"CD-R / UNMARKED",category:"CDR",image:"media/images/archive/cassette/cassette-image-08.jpg",depth:0},
    {id:"PC32-G004",title:"DOCUMENT PRINT",category:"PRINT",image:"media/images/archive/memopad/mmpd-004.jpeg",depth:0},
    {id:"PC32-G005",title:"USED OBJECT",category:"USED",image:"media/images/archive/cassette/cassette-image-10.jpg",depth:0},
    {id:"PC32-G006",title:"MEMOPAD ZINE",category:"ZINE",image:"media/images/archive/memopad/mmpd-024.jpeg",depth:0},
    {id:"PC32-G007",title:"UNCLASSIFIED OBJECT",category:"OTHER",image:"media/images/archive/cassette/cassette-image-11.jpg",depth:0},
    {id:"PC32-B001",title:"BOOTLEG / DEEP COPY",category:"BOOTLEG",image:"media/images/archive/memopad/mmpd-018.jpeg",depth:1}
  ],
  audiovisual: [
    {id:"AV-001",title:"KIAROSTAMI LOOP",file:"media/videos/audiovisual/kiarostami.mp4",category:"FILM",depth:0},
    {id:"AV-002",title:"MIRROR",file:"media/videos/audiovisual/mirror.mp4",category:"VISUAL LOOP",depth:0},
    {id:"AV-003",title:"SCRAP",file:"media/videos/audiovisual/scrap.mp4",category:"TEXTURE",depth:0},
    {id:"AV-004",title:"SCREW",file:"media/videos/audiovisual/screw.mp4",category:"VISUAL LOOP",depth:0},
    {id:"AV-005",title:"NEGATIVE CUT-IN",file:"media/videos/audiovisual/negative-cut-in.mp4",category:"イメージの世界",depth:1},
    {id:"AV-006",title:"ITO / NEGATIVE",file:"media/videos/audiovisual/negative-takashi.mp4",category:"イメージの世界",depth:2},
    {id:"AV-007",title:"GENKAKU FISH",file:"media/videos/audiovisual/genkaku-fish.mp4",category:"イメージの世界",depth:3}
  ],
  audioCategories:["RELEASES","LOOPS/TEXTURE","FIELD RECORD","SOUND DIARY","DEMO","MIXES"],
  archiveCodes:["ALL","PC32","MMPD","GTLP","DEEP","BOOT","DEMO"],
  archiveGenres:["ALL","ABSTRACT","AMBIENT","ACTIVE LEARNING","COLLAGE","CONCRETE","EXPERIMENTAL","NOISE","SOUNDTRACK","OTHER"],
  akagiSentence:"THE INDEX IS NOT THE ARCHIVE.",
  bugMedia:[
    "media/videos/bug/404-window-01.mp4","media/videos/bug/404-window-02.mp4","media/videos/bug/404-window-10.mp4",
    "media/videos/bug/404-window-11.mp4","media/videos/bug/404-window-12.mp4","media/videos/bug/404-window-13.mp4",
    "media/videos/bug/404-window-14.mp4","media/videos/bug/404-window-15.mp4","media/videos/bug/404-window-027.mp4",
    "media/images/bug/alien.png","media/videos/bug/ascii-genbaku-bug-window.mp4","media/videos/bug/ascii-money-bug-window.mp4"
  ],
  banners:[
    {label:"LPPP / OPEN TRANSMISSION",image:"media/videos/bug/404-window-lppp-02.mp4",href:"https://agonist-antagonist.github.io/lppproject/"},
    {label:"XXX FREE ACCESS / INFECTED",image:"media/videos/bug/404-window-porn.mp4",href:"?infected=1"}
  ],
  infectionVariants:[
    {id:"arabic",label:"ARABIC NODE",lang:"ar",dir:"rtl",title:"سوق بلا ولاية",currency:"د.إ",palette:"oxide",background:"grid"},
    {id:"russian",label:"RUSSIAN NODE",lang:"ru",dir:"ltr",title:"РЫНОК БЕЗ ЮРИСДИКЦИИ",currency:"₽",palette:"terminal",background:"scan"},
    {id:"hebrew",label:"HEBREW NODE",lang:"he",dir:"rtl",title:"שוק ללא סמכות",currency:"₪",palette:"medical",background:"tiles"},
    {id:"chinese",label:"CHINESE NODE",lang:"zh",dir:"ltr",title:"无管辖权市场",currency:"CN¥",palette:"signal",background:"noise"}
  ],
  marketProducts:[
    {id:"BM-001",category:"DEFENSE",title:"TACTICAL RELIC / TYPE-82",translated:"防御用遺物・使用目的は確認されていません",price:"2,824",btc:"0.0318",vendor:"north_archive",rating:"98.4",origin:"RU",image:"media/images/archive/cassette/cassette-image-01.jpg",detail:"UNREGISTERED STEEL OBJECT / DOCUMENTS REMOVED"},
    {id:"BM-002",category:"BIOLOGICAL",title:"BIOLOGICAL PARCEL / TYPE-O",translated:"生物学的な小包・温度を維持してください",price:"8,208",btc:"0.0921",vendor:"coldroom_82",rating:"96.2",origin:"CN",image:"media/images/archive/memopad/mmpd-012.jpeg",detail:"COLD CHAIN INCOMPLETE / HUMAN ORIGIN UNCONFIRMED"},
    {id:"BM-003",category:"PHARMACY",title:"NEURO TABLET / RX-32",translated:"神経用の錠剤・処方記録は存在しません",price:"32.00",btc:"0.00036",vendor:"rx_without_name",rating:"99.1",origin:"NL",image:"media/images/archive/cassette/cassette-image-08.jpg",detail:"24 TABLETS / COMPOSITION PARTIALLY ERASED"},
    {id:"BM-004",category:"ADULT",title:"SYNTHETIC COMPANION / USED",translated:"合成人間の同伴装置・返品された状態",price:"824",btc:"0.00927",vendor:"softbody_store",rating:"91.8",origin:"DE",image:"media/images/archive/memopad/mmpd-018.jpeg",detail:"FACIAL DATA REMOVED / SURFACE DAMAGE"},
    {id:"BM-005",category:"SIGNAL",title:"PORTABLE SIGNAL SILENCER",translated:"携帯する信号の沈黙装置",price:"320.00",btc:"0.00360",vendor:"dead_frequency",rating:"97.7",origin:"UA",image:"media/images/archive/cassette/cassette-image-04.jpg",detail:"RANGE UNKNOWN / BATTERY NOT INCLUDED"},
    {id:"BM-006",category:"MEDICAL",title:"SURGICAL CASE / UNMARKED",translated:"外科用の箱・所有者がありません",price:"82.40",btc:"0.00093",vendor:"clinic_exit",rating:"94.5",origin:"IL",image:"media/images/archive/memopad/mmpd-004.jpeg",detail:"CONTENTS SEALED / STERILITY EXPIRED"},
    {id:"BM-007",category:"SUPPLEMENT",title:"MEMORY POWDER / 12 DOSES",translated:"記憶を増加すると記載された粉末",price:"640",image:"",detail:"CLAIMS NOT VERIFIED / KEEP AWAY FROM LIGHT"},
    {id:"BM-008",category:"UNKNOWN",title:"SOFT OBJECT / MOSAIC-A",translated:"柔らかい商品・画像は行政により処理済み",price:"1,280",image:"",detail:"PURPOSE UNKNOWN / DO NOT OPEN IN TRANSIT"},
    {id:"BM-009",category:"DEFENSE",title:"CERAMIC EDGE / NO SERIAL",translated:"連続番号のない陶製の刃",price:"460",image:"",detail:"NON-METALLIC COMPONENT / DISPLAY OBJECT"},
    {id:"BM-010",category:"BIOLOGICAL",title:"PRESERVED SAMPLE / RED",translated:"赤い保存試料・出所は翻訳できません",price:"4,120",image:"",detail:"LABELED AS EDUCATIONAL / LABEL ALTERED"},
    {id:"BM-011",category:"ADULT",title:"PRIVATE MECHANISM / MODEL 7",translated:"個人的な機械・七番目の模型",price:"97.00",image:"",detail:"REMOTE CONTROL MISSING / SANITIZED"},
    {id:"BM-012",category:"PHARMACY",title:"BLUE CAPSULE / SLEEP INDEX",translated:"青色カプセル・睡眠索引",price:"38",image:"",detail:"LANGUAGE OF INSERT UNKNOWN / 10 CAPSULES"},
    {id:"BM-013",category:"SURVEILLANCE",title:"OPTICAL NODE / MICRO",translated:"非常に小さい観察の節点",price:"760",image:"",detail:"TRANSMISSION PROTOCOL REDACTED"},
    {id:"BM-014",category:"MEDICAL",title:"ANATOMICAL TOOL / LOT 4",translated:"解剖学的な道具・第四の集まり",price:"214",image:"",detail:"USED / CLEANING HISTORY UNAVAILABLE"},
    {id:"BM-015",category:"SUPPLEMENT",title:"ANTI-AGE LIQUID / GOLD",translated:"年齢に反対する金色の液体",price:"188",image:"",detail:"NOT APPROVED FOR INTERNAL USE"},
    {id:"BM-016",category:"UNKNOWN",title:"BLACK BOX / BREATHING",translated:"呼吸しているように見える黒い箱",price:"9,999",image:"",detail:"DO NOT DISCONNECT / AUDIO DETECTED"},
    {id:"BM-017",category:"SIGNAL",title:"FREQUENCY KEY / 820824",translated:"周波数を開ける鍵・八二〇八二四",price:"824",image:"",detail:"ONE-TIME ACCESS / ORIGIN WITHHELD"},
    {id:"BM-018",category:"BIOLOGICAL",title:"DENTAL ARCHIVE / MIXED",translated:"歯科の記録物・複数人が混ざっています",price:"540",image:"",detail:"RESEARCH PROP / IDENTITY REMOVED"},
    {id:"BM-019",category:"ADULT",title:"LATEX FORM / HUMAN SCALE",translated:"人間寸法のラテックス形式",price:"1,600",image:"",detail:"STORAGE CREASES / COLOR MAY VARY"},
    {id:"BM-020",category:"PHARMACY",title:"EMERGENCY BLISTER / 6",translated:"緊急用の六錠包装・用途は空欄です",price:"66",image:"",detail:"INSTRUCTIONS CORRUPTED / SEALED"}
  ]
};
