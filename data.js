export const GAME_DATA = [
    {
        category: "Pop 2000s",
        questions: [
            { id: "c1p100", points: 100, audio: "audio/c1_100.mp3", title: "Toxic", artist: "Britney Spears" },
            { id: "c1p200", points: 200, audio: "audio/c1_200.mp3", title: "Bye Bye Bye", artist: "NSYNC" },
            { id: "c1p300", points: 300, audio: "audio/c1_300.mp3", title: "Hey Ya!", artist: "Outkast" },
            { id: "c1p400", points: 400, audio: "audio/c1_400.mp3", title: "Complicated", artist: "Avril Lavigne" },
            { id: "c1p500", points: 500, audio: "audio/c1_500.mp3", title: "Mr. Brightside", artist: "The Killers" }
        ]
    },
    {
        category: "Indo Hits",
        questions: [
            { id: "c2p100", points: 100, audio: "audio/c2_100.mp3", title: "Kangen", artist: "Dewa 19" },
            { id: "c2p200", points: 200, audio: "audio/c2_200.mp3", title: "Dan", artist: "Sheila On 7" },
            { id: "c2p300", points: 300, audio: "audio/c2_300.mp3", title: "Manusia Bodoh", artist: "Ada Band" },
            { id: "c2p400", points: 400, audio: "audio/c2_400.mp3", title: "Kenangan Terindah", artist: "Samsons" },
            { id: "c2p500", points: 500, audio: "audio/c2_500.mp3", title: "Ruang Rindu", artist: "Letto" }
        ]
    },
    {
        category: "Anime OP",
        questions: [
            { id: "c3p100", points: 100, audio: "audio/c3_100.mp3", title: "Gurenge", artist: "LiSA" },
            { id: "c3p200", points: 200, audio: "audio/c3_200.mp3", title: "Unravel", artist: "TK" },
            { id: "c3p300", points: 300, audio: "audio/c3_300.mp3", title: "Silhouette", artist: "KANA-BOON" },
            { id: "c3p400", points: 400, audio: "audio/c3_400.mp3", title: "Colors", artist: "FLOW" },
            { id: "c3p500", points: 500, audio: "audio/c3_500.mp3", title: "Cruel Angel's Thesis", artist: "Yoko Takahashi" }
        ]
    }
];

export const DEFAULT_TIEBREAKER = [
    {
        category: "Tiebreaker Pop",
        question: { id: "tb_0", points: 100, audio: "audio/c1_100.mp3", title: "Toxic", artist: "Britney Spears", video: "" }
    },
    {
        category: "Tiebreaker Indo",
        question: { id: "tb_1", points: 100, audio: "audio/c2_100.mp3", title: "Kangen", artist: "Dewa 19", video: "" }
    },
    {
        category: "Tiebreaker Anime",
        question: { id: "tb_2", points: 100, audio: "audio/c3_100.mp3", title: "Gurenge", artist: "LiSA", video: "" }
    }
];

export const DEFAULT_AUDIENCE_DATA = Array.from({ length: 20 }, (_, i) => ({
    id: `aud_${i + 1}`,
    number: i + 1,
    title: `Lagu Penonton ${i + 1}`,
    artist: `Penyanyi ${i + 1}`,
    audio: `audio/c${(i % 3) + 1}_${((i % 5) + 1) * 100}.mp3`,
    video: ""
}));


