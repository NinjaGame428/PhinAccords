export interface Song {
  id: number;
  title: string;
  artist: string;
  key: string;
  difficulty: string;
  category: string;
  year: string;
  tempo: string;
  timeSignature: string;
  genre: string;
  chords: string[];
  chordProgression: string;
  lyrics: string;
  chordChart: string;
  capo: string;
  strummingPattern: string;
  tags: string[];
  downloads: number;
  rating: number;
  description: string;
  slug?: string;
  // YouTube fields
  url?: string;
  thumbnail?: string;
  duration?: string;
  published_at?: string;
  quality?: string;
  language?: string;
  captions_available?: boolean;
}

export const songs: Song[] = [
  {
    id: 1,
    title: "Amazing Grace",
    artist: "John Newton",
    key: "G Major",
    difficulty: "Easy",
    category: "Classic Hymn",
    year: "1779",
    tempo: "72 BPM",
    timeSignature: "4/4",
    genre: "Classic Hymn",
    chords: ["G", "C", "D", "G"],
    chordProgression: "G - C - D - G",
    lyrics: `Amazing grace, how sweet the sound
That saved a wretch like me
I once was lost but now I'm found
Was blind but now I see

T'was grace that taught my heart to fear
And grace my fears relieved
How precious did that grace appear
The hour I first believed

Through many dangers, toils and snares
I have already come
T'was grace that brought me safe thus far
And grace will lead me home

When we've been there ten thousand years
Bright shining as the sun
We've no less days to sing God's praise
Than when we'd first begun`,
    chordChart: `G           C           D           G
Amazing grace, how sweet the sound
G           C           D           G
That saved a wretch like me
G           C           D           G
I once was lost but now I'm found
G           C           D           G
Was blind but now I see

G           C           D           G
T'was grace that taught my heart to fear
G           C           D           G
And grace my fears relieved
G           C           D           G
How precious did that grace appear
G           C           D           G
The hour I first believed`,
    capo: "No capo needed",
    strummingPattern: "Down, Down, Up, Down, Up, Down",
    tags: ["Traditional", "Worship", "Popular"],
    downloads: 15420,
    rating: 4.9,
    description: "One of the most beloved hymns of all time, written by John Newton after his conversion from slave trading to Christianity."
  },
  {
    id: 2,
    title: "How Great Thou Art",
    artist: "Stuart Hine",
    key: "C Major",
    difficulty: "Medium",
    category: "Classic Hymn",
    year: "1949",
    tempo: "68 BPM",
    timeSignature: "4/4",
    genre: "Classic Hymn",
    chords: ["C", "F", "G", "Am"],
    chordProgression: "C - F - G - Am",
    lyrics: `O Lord my God, when I in awesome wonder
Consider all the worlds Thy hands have made
I see the stars, I hear the rolling thunder
Thy power throughout the universe displayed

Then sings my soul, my Savior God, to Thee
How great Thou art, how great Thou art
Then sings my soul, my Savior God, to Thee
How great Thou art, how great Thou art

When through the woods and forest glades I wander
And hear the birds sing sweetly in the trees
When I look down from lofty mountain grandeur
And hear the brook and feel the gentle breeze

Then sings my soul, my Savior God, to Thee
How great Thou art, how great Thou art
Then sings my soul, my Savior God, to Thee
How great Thou art, how great Thou art`,
    chordChart: `C           F           G           Am
O Lord my God, when I in awesome wonder
C           F           G           Am
Consider all the worlds Thy hands have made
C           F           G           Am
I see the stars, I hear the rolling thunder
C           F           G           Am
Thy power throughout the universe displayed

C           F           G           Am
Then sings my soul, my Savior God, to Thee
C           F           G           Am
How great Thou art, how great Thou art
C           F           G           Am
Then sings my soul, my Savior God, to Thee
C           F           G           Am
How great Thou art, how great Thou art`,
    capo: "No capo needed",
    strummingPattern: "Down, Down, Up, Down, Up, Down",
    tags: ["Traditional", "Worship", "Majestic"],
    downloads: 12300,
    rating: 4.8,
    description: "A powerful hymn celebrating God's creation and majesty, originally a Swedish folk song."
  },
  {
    id: 3,
    title: "Great Is Thy Faithfulness",
    artist: "Thomas Chisholm",
    key: "F Major",
    difficulty: "Easy",
    category: "Classic Hymn",
    year: "1923",
    tempo: "76 BPM",
    timeSignature: "4/4",
    genre: "Classic Hymn",
    chords: ["F", "Bb", "C", "F"],
    chordProgression: "F - Bb - C - F",
    lyrics: `Great is Thy faithfulness, O God my Father
There is no shadow of turning with Thee
Thou changest not, Thy compassions, they fail not
As Thou hast been Thou forever wilt be

Great is Thy faithfulness! Great is Thy faithfulness!
Morning by morning new mercies I see
All I have needed Thy hand hath provided
Great is Thy faithfulness, Lord, unto me

Summer and winter and springtime and harvest
Sun, moon and stars in their courses above
Join with all nature in manifold witness
To Thy great faithfulness, mercy and love

Great is Thy faithfulness! Great is Thy faithfulness!
Morning by morning new mercies I see
All I have needed Thy hand hath provided
Great is Thy faithfulness, Lord, unto me`,
    chordChart: `F           Bb          C           F
Great is Thy faithfulness, O God my Father
F           Bb          C           F
There is no shadow of turning with Thee
F           Bb          C           F
Thou changest not, Thy compassions, they fail not
F           Bb          C           F
As Thou hast been Thou forever wilt be

F           Bb          C           F
Great is Thy faithfulness! Great is Thy faithfulness!
F           Bb          C           F
Morning by morning new mercies I see
F           Bb          C           F
All I have needed Thy hand hath provided
F           Bb          C           F
Great is Thy faithfulness, Lord, unto me`,
    capo: "No capo needed",
    strummingPattern: "Down, Down, Up, Down, Up, Down",
    tags: ["Traditional", "Faith", "Trust"],
    downloads: 9800,
    rating: 4.7,
    description: "A timeless hymn about God's unchanging faithfulness and love."
  },
  {
    id: 4,
    title: "Blessed Be Your Name",
    artist: "Matt Redman",
    key: "G Major",
    difficulty: "Medium",
    category: "Contemporary",
    year: "2002",
    tempo: "120 BPM",
    timeSignature: "4/4",
    genre: "Contemporary Worship",
    chords: ["G", "C", "D", "Em"],
    chordProgression: "G - C - D - Em",
    lyrics: `Blessed be Your name in the land that is plentiful
Where Your streams of abundance flow
Blessed be Your name

Blessed be Your name when I'm found in the desert place
Though I walk through the wilderness
Blessed be Your name

Every blessing You pour out I'll turn back to praise
When the darkness closes in, Lord, still I will say

Blessed be the name of the Lord
Blessed be Your name
Blessed be the name of the Lord
Blessed be Your glorious name

You give and take away
You give and take away
My heart will choose to say
Lord, blessed be Your name`,
    chordChart: `G           C           D           Em
Blessed be Your name in the land that is plentiful
G           C           D           Em
Where Your streams of abundance flow
G           C           D           Em
Blessed be Your name

G           C           D           Em
Blessed be Your name when I'm found in the desert place
G           C           D           Em
Though I walk through the wilderness
G           C           D           Em
Blessed be Your name

G           C           D           Em
Every blessing You pour out I'll turn back to praise
G           C           D           Em
When the darkness closes in, Lord, still I will say

G           C           D           Em
Blessed be the name of the Lord
G           C           D           Em
Blessed be Your name
G           C           D           Em
Blessed be the name of the Lord
G           C           D           Em
Blessed be Your glorious name`,
    capo: "No capo needed",
    strummingPattern: "Down, Down, Up, Down, Up, Down",
    tags: ["Contemporary", "Worship", "Praise"],
    downloads: 11200,
    rating: 4.6,
    description: "A modern worship song about praising God in all circumstances of life."
  },
  {
    id: 5,
    title: "How Great Is Our God",
    artist: "Chris Tomlin",
    key: "C Major",
    difficulty: "Easy",
    category: "Contemporary",
    year: "2004",
    tempo: "140 BPM",
    timeSignature: "4/4",
    genre: "Contemporary Worship",
    chords: ["C", "F", "G", "Am"],
    chordProgression: "C - F - G - Am",
    lyrics: `The splendor of a King, clothed in majesty
Let all the earth rejoice, all the earth rejoice
He wraps Himself in light, and darkness tries to hide
And trembles at His voice, trembles at His voice

How great is our God, sing with me
How great is our God, and all will see
How great, how great is our God

Age to age He stands, and time is in His hands
Beginning and the end, beginning and the end
The Godhead, three in one, Father, Spirit, Son
The Lion and the Lamb, the Lion and the Lamb

How great is our God, sing with me
How great is our God, and all will see
How great, how great is our God

Name above all names, worthy of all praise
My heart will sing how great is our God`,
    chordChart: `C           F           G           Am
The splendor of a King, clothed in majesty
C           F           G           Am
Let all the earth rejoice, all the earth rejoice
C           F           G           Am
He wraps Himself in light, and darkness tries to hide
C           F           G           Am
And trembles at His voice, trembles at His voice

C           F           G           Am
How great is our God, sing with me
C           F           G           Am
How great is our God, and all will see
C           F           G           Am
How great, how great is our God`,
    capo: "No capo needed",
    strummingPattern: "Down, Down, Up, Down, Up, Down",
    tags: ["Contemporary", "Worship", "Majesty"],
    downloads: 18700,
    rating: 4.9,
    description: "A powerful declaration of God's greatness and majesty in contemporary worship style."
  },
  {
    id: 6,
    title: "10,000 Reasons",
    artist: "Matt Redman",
    key: "D Major",
    difficulty: "Medium",
    category: "Contemporary",
    year: "2011",
    tempo: "132 BPM",
    timeSignature: "4/4",
    genre: "Contemporary Worship",
    chords: ["D", "G", "A", "Bm"],
    chordProgression: "D - G - A - Bm",
    lyrics: `The sun comes up, it's a new day dawning
It's time to sing Your song again
Whatever may pass and whatever lies before me
Let me be singing when the evening comes

Bless the Lord, O my soul
O my soul, worship His holy name
Sing like never before, O my soul
I'll worship Your holy name

You're rich in love and You're slow to anger
Your name is great and Your heart is kind
For all Your goodness I will keep on singing
Ten thousand reasons for my heart to find

Bless the Lord, O my soul
O my soul, worship His holy name
Sing like never before, O my soul
I'll worship Your holy name`,
    chordChart: `D           G           A           Bm
The sun comes up, it's a new day dawning
D           G           A           Bm
It's time to sing Your song again
D           G           A           Bm
Whatever may pass and whatever lies before me
D           G           A           Bm
Let me be singing when the evening comes

D           G           A           Bm
Bless the Lord, O my soul
D           G           A           Bm
O my soul, worship His holy name
D           G           A           Bm
Sing like never before, O my soul
D           G           A           Bm
I'll worship Your holy name`,
    capo: "No capo needed",
    strummingPattern: "Down, Down, Up, Down, Up, Down",
    tags: ["Contemporary", "Gratitude", "Praise"],
    downloads: 16500,
    rating: 4.8,
    description: "A beautiful song of gratitude and praise, encouraging believers to bless the Lord."
  },
  {
    id: 7,
    title: "What A Beautiful Name",
    artist: "Hillsong Worship",
    key: "E Major",
    difficulty: "Medium",
    category: "Contemporary",
    year: "2016",
    tempo: "68 BPM",
    timeSignature: "4/4",
    genre: "Contemporary Worship",
    chords: ["E", "C#m", "A", "B"],
    chordProgression: "E - C#m - A - B",
    lyrics: `You were the Word at the beginning
One with God the Lord Most High
Your hidden glory in creation
Now revealed in You our Christ

What a beautiful Name it is
What a beautiful Name it is
The Name of Jesus Christ my King

What a beautiful Name it is
Nothing compares to this
What a beautiful Name it is
The Name of Jesus

You didn't want heaven without us
So Jesus You brought heaven down
My sin was great, Your love was greater
What could separate us now

What a wonderful Name it is
What a wonderful Name it is
The Name of Jesus Christ my King

What a wonderful Name it is
Nothing compares to this
What a wonderful Name it is
The Name of Jesus`,
    chordChart: `E           C#m         A           B
You were the Word at the beginning
E           C#m         A           B
One with God the Lord Most High
E           C#m         A           B
Your hidden glory in creation
E           C#m         A           B
Now revealed in You our Christ

E           C#m         A           B
What a beautiful Name it is
E           C#m         A           B
What a beautiful Name it is
E           C#m         A           B
The Name of Jesus Christ my King`,
    capo: "No capo needed",
    strummingPattern: "Down, Down, Up, Down, Up, Down",
    tags: ["Contemporary", "Jesus", "Worship"],
    downloads: 22100,
    rating: 4.9,
    description: "A modern worship anthem celebrating the name and power of Jesus Christ."
  },
  {
    id: 8,
    title: "Good Good Father",
    artist: "Chris Tomlin",
    key: "G Major",
    difficulty: "Easy",
    category: "Contemporary",
    year: "2015",
    tempo: "76 BPM",
    timeSignature: "4/4",
    genre: "Contemporary Worship",
    chords: ["G", "C", "D", "Em"],
    chordProgression: "G - C - D - Em",
    lyrics: `I've heard a thousand stories of what they think You're like
But I've heard the tender whisper of love in the dead of night
And You tell me that You're pleased and that I'm never alone

You're a good, good Father
It's who You are, it's who You are, it's who You are
And I'm loved by You
It's who I am, it's who I am, it's who I am

I've seen many searching for signs that You're listening
So many ways that I've tried to tell You what I'm thinking
And You tell me that You're pleased and that I'm never alone

You're a good, good Father
It's who You are, it's who You are, it's who You are
And I'm loved by You
It's who I am, it's who I am, it's who I am`,
    chordChart: `G           C           D           Em
I've heard a thousand stories of what they think You're like
G           C           D           Em
But I've heard the tender whisper of love in the dead of night
G           C           D           Em
And You tell me that You're pleased and that I'm never alone

G           C           D           Em
You're a good, good Father
G           C           D           Em
It's who You are, it's who You are, it's who You are
G           C           D           Em
And I'm loved by You
G           C           D           Em
It's who I am, it's who I am, it's who I am`,
    capo: "No capo needed",
    strummingPattern: "Down, Down, Up, Down, Up, Down",
    tags: ["Contemporary", "Father", "Love"],
    downloads: 14300,
    rating: 4.7,
    description: "A heartfelt song about God's perfect fatherly love and care."
  },
  {
    id: 9,
    title: "In Christ Alone",
    artist: "Keith Getty",
    key: "C Major",
    difficulty: "Medium",
    category: "Modern Hymn",
    year: "2001",
    tempo: "72 BPM",
    timeSignature: "4/4",
    genre: "Modern Hymn",
    chords: ["C", "F", "G", "Am"],
    chordProgression: "C - F - G - Am",
    lyrics: `In Christ alone my hope is found
He is my light, my strength, my song
This Cornerstone, this solid Ground
Firm through the fiercest drought and storm

What heights of love, what depths of peace
When fears are stilled, when strivings cease
My Comforter, my All in All
Here in the love of Christ I stand

In Christ alone, who took on flesh
Fullness of God in helpless babe
This gift of love and righteousness
Scorned by the ones He came to save

Till on that cross as Jesus died
The wrath of God was satisfied
For every sin on Him was laid
Here in the death of Christ I live`,
    chordChart: `C           F           G           Am
In Christ alone my hope is found
C           F           G           Am
He is my light, my strength, my song
C           F           G           Am
This Cornerstone, this solid Ground
C           F           G           Am
Firm through the fiercest drought and storm

C           F           G           Am
What heights of love, what depths of peace
C           F           G           Am
When fears are stilled, when strivings cease
C           F           G           Am
My Comforter, my All in All
C           F           G           Am
Here in the love of Christ I stand`,
    capo: "No capo needed",
    strummingPattern: "Down, Down, Up, Down, Up, Down",
    tags: ["Modern Hymn", "Christ", "Faith"],
    downloads: 12800,
    rating: 4.8,
    description: "A modern hymn celebrating the sufficiency and supremacy of Christ."
  },
  {
    id: 10,
    title: "Cornerstone",
    artist: "Hillsong Worship",
    key: "G Major",
    difficulty: "Easy",
    category: "Contemporary",
    year: "2012",
    tempo: "80 BPM",
    timeSignature: "4/4",
    genre: "Contemporary Worship",
    chords: ["G", "C", "D", "Em"],
    chordProgression: "G - C - D - Em",
    lyrics: `My hope is built on nothing less
Than Jesus' blood and righteousness
I dare not trust the sweetest frame
But wholly trust in Jesus' name

Christ alone, cornerstone
Weak made strong in the Savior's love
Through the storm, He is Lord
Lord of all

When darkness seems to hide His face
I rest on His unchanging grace
In every high and stormy gale
My anchor holds within the veil
My anchor holds within the veil

Christ alone, cornerstone
Weak made strong in the Savior's love
Through the storm, He is Lord
Lord of all`,
    chordChart: `G           C           D           Em
My hope is built on nothing less
G           C           D           Em
Than Jesus' blood and righteousness
G           C           D           Em
I dare not trust the sweetest frame
G           C           D           Em
But wholly trust in Jesus' name

G           C           D           Em
Christ alone, cornerstone
G           C           D           Em
Weak made strong in the Savior's love
G           C           D           Em
Through the storm, He is Lord
G           C           D           Em
Lord of all`,
    capo: "No capo needed",
    strummingPattern: "Down, Down, Up, Down, Up, Down",
    tags: ["Contemporary", "Foundation", "Hope"],
    downloads: 15200,
    rating: 4.6,
    description: "A contemporary worship song based on the hymn 'My Hope Is Built'."
  }
];

// Helper function to get song by slug
export const getSongBySlug = (slug: string): Song | undefined => {
  return songs.find(song => 
    song.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug
  );
};

// Helper function to get song by ID
export const getSongById = (id: number): Song | undefined => {
  return songs.find(song => song.id === id);
};
