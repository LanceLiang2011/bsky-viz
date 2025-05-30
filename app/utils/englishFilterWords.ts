// Enhanced English filter words for better word cloud quality
// This includes common stop words, web-specific terms, and meaningless filler words

export const ENGLISH_FILTER_WORDS = new Set([
  // Basic English stop words
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "has",
  "he",
  "in",
  "is",
  "it",
  "its",
  "of",
  "on",
  "that",
  "the",
  "to",
  "was",
  "will",
  "with",
  "have",
  "had",
  "been",
  "were",
  "are",
  "am",
  "being",
  "would",
  "could",
  "should",
  "may",
  "might",
  "can",
  "must",
  "shall",
  "ought",
  "do",
  "does",
  "did",
  "done",
  "doing",

  // Pronouns and basic words
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "me",
  "him",
  "her",
  "us",
  "them",
  "my",
  "your",
  "his",
  "her",
  "its",
  "our",
  "their",
  "this",
  "that",
  "these",
  "those",
  "here",
  "there",
  "where",
  "when",
  "why",
  "how",
  "what",
  "who",
  "which",
  "whose",
  "whom",

  // Common verbs that add little meaning
  "is",
  "was",
  "are",
  "were",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "done",
  "doing",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "can",
  "must",
  "shall",
  "ought",
  "get",
  "got",
  "getting",
  "go",
  "goes",
  "going",
  "went",
  "gone",
  "come",
  "comes",
  "coming",
  "came",
  "take",
  "takes",
  "taking",
  "took",
  "taken",
  "make",
  "makes",
  "making",
  "made",
  "give",
  "gives",
  "giving",
  "gave",
  "given",
  "say",
  "says",
  "saying",
  "said",
  "tell",
  "tells",
  "telling",
  "told",
  "know",
  "knows",
  "knowing",
  "knew",
  "known",
  "think",
  "thinks",
  "thinking",
  "thought",
  "see",
  "sees",
  "seeing",
  "saw",
  "seen",
  "look",
  "looks",
  "looking",
  "looked",

  // Temporal and spatial words
  "now",
  "then",
  "here",
  "there",
  "up",
  "down",
  "in",
  "out",
  "on",
  "off",
  "over",
  "under",
  "above",
  "below",
  "before",
  "after",
  "during",
  "while",
  "since",
  "until",
  "again",
  "once",
  "always",
  "never",
  "sometimes",
  "often",
  "usually",
  "already",
  "still",
  "yet",
  "soon",
  "later",
  "today",
  "yesterday",
  "tomorrow",
  "tonight",
  "morning",
  "afternoon",
  "evening",

  // Quantifiers and intensifiers
  "all",
  "some",
  "any",
  "many",
  "much",
  "more",
  "most",
  "less",
  "least",
  "few",
  "several",
  "enough",
  "too",
  "very",
  "really",
  "quite",
  "rather",
  "pretty",
  "so",
  "such",
  "just",
  "only",
  "even",
  "also",
  "both",
  "either",
  "neither",
  "each",
  "every",
  "other",
  "another",

  // Common filler words and expressions
  "actually",
  "basically",
  "literally",
  "definitely",
  "absolutely",
  "completely",
  "totally",
  "exactly",
  "obviously",
  "certainly",
  "perhaps",
  "probably",
  "maybe",
  "possibly",
  "generally",
  "usually",
  "normally",
  "typically",
  "particularly",
  "especially",
  "specifically",
  "mostly",
  "mainly",
  "largely",
  "primarily",
  "essentially",
  "ultimately",
  "eventually",
  "finally",
  "initially",
  "originally",
  "previously",
  "recently",
  "currently",
  "presently",
  "immediately",
  "suddenly",
  "quickly",
  "slowly",
  "carefully",
  "clearly",
  "easily",
  "simply",

  // Conversation words and interjections
  "yeah",
  "yes",
  "no",
  "okay",
  "ok",
  "alright",
  "sure",
  "fine",
  "well",
  "oh",
  "ah",
  "um",
  "uh",
  "hmm",
  "wow",
  "hey",
  "hi",
  "hello",
  "bye",
  "thanks",
  "thank",
  "please",
  "sorry",
  "excuse",
  "pardon",

  // Web and tech specific terms
  "www",
  "http",
  "https",
  "com",
  "org",
  "net",
  "edu",
  "gov",
  "co",
  "uk",
  "ca",
  "au",
  "de",
  "fr",
  "jp",
  "cn",
  "ru",
  "br",
  "in",
  "it",
  "es",
  "html",
  "htm",
  "php",
  "asp",
  "jsp",
  "xml",
  "css",
  "js",
  "gif",
  "jpg",
  "jpeg",
  "png",
  "pdf",
  "doc",
  "txt",
  "zip",
  "exe",
  "dll",
  "mp3",
  "mp4",
  "avi",
  "mov",
  "wmv",
  "flv",
  "swf",
  "ftp",
  "ssh",
  "tcp",
  "udp",
  "ip",
  "dns",
  "url",
  "uri",
  "api",
  "sql",
  "json",
  "csv",
  "rss",
  "xml",

  // Social media and internet slang
  "lol",
  "lmao",
  "rofl",
  "omg",
  "wtf",
  "btw",
  "fyi",
  "imo",
  "imho",
  "aka",
  "asap",
  "tldr",
  "nsfw",
  "irl",
  "tbt",
  "icymi",
  "afaik",
  "tbh",
  "ftw",
  "smh",
  "nbd",
  "dm",
  "pm",
  "rt",
  "via",
  "cc",
  "follow",
  "unfollow",
  "like",
  "unlike",
  "share",
  "retweet",
  "tweet",
  "post",
  "comment",
  "reply",
  "mention",
  "hashtag",
  "tag",
  "link",

  // Bluesky and social platform specific
  "bluesky",
  "bsky",
  "social",
  "platform",
  "feed",
  "timeline",
  "profile",
  "avatar",
  "handle",
  "did",
  "protocol",
  "atproto",
  "decentralized",
  "moderation",
  "algorithm",
  "content",
  "policy",
  "privacy",
  "security",

  // Common meaningless fragments
  "something",
  "anything",
  "everything",
  "nothing",
  "someone",
  "anyone",
  "everyone",
  "nobody",
  "somewhere",
  "anywhere",
  "everywhere",
  "nowhere",
  "somehow",
  "anyhow",
  "anyway",
  "anyways",
  "whatever",
  "whenever",
  "wherever",
  "whoever",
  "however",
  "whichever",
  "stuff",
  "things",
  "thing",
  "way",
  "ways",
  "kind",
  "sort",
  "type",
  "lots",
  "bunch",

  // Articles and determiners
  "the",
  "a",
  "an",
  "some",
  "any",
  "many",
  "much",
  "few",
  "little",
  "several",
  "all",
  "both",
  "either",
  "neither",
  "each",
  "every",
  "another",
  "other",
  "same",
  "different",
  "such",
  "certain",

  // Common adjectives that add little meaning
  "good",
  "bad",
  "great",
  "nice",
  "fine",
  "okay",
  "big",
  "small",
  "large",
  "little",
  "high",
  "low",
  "long",
  "short",
  "old",
  "new",
  "young",
  "easy",
  "hard",
  "simple",
  "difficult",
  "right",
  "wrong",
  "true",
  "false",
  "real",
  "fake",
  "full",
  "empty",
  "open",
  "closed",

  // Conjunctions and transitions
  "but",
  "however",
  "though",
  "although",
  "while",
  "whereas",
  "because",
  "since",
  "as",
  "if",
  "unless",
  "until",
  "when",
  "whenever",
  "where",
  "wherever",
  "whether",
  "that",
  "which",
  "who",
  "whom",
  "whose",
  "therefore",
  "thus",
  "hence",
  "consequently",
  "accordingly",
  "moreover",
  "furthermore",
  "besides",
  "additionally",
  "also",
  "too",
  "either",
  "neither",
  "nor",
  "so",
  "yet",
  "still",
  "nevertheless",
  "nonetheless",

  // Numbers and ordinals (written form)
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
  "hundred",
  "thousand",
  "million",
  "billion",
  "first",
  "second",
  "third",
  "fourth",
  "fifth",
  "sixth",
  "seventh",
  "eighth",
  "ninth",
  "tenth",

  // Time and date related
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
  "am",
  "pm",
  "morning",
  "afternoon",
  "evening",
  "night",
  "day",
  "week",
  "month",
  "year",
  "time",
  "date",
  "hour",
  "minute",
  "second",

  // Common prepositions
  "about",
  "above",
  "across",
  "after",
  "against",
  "along",
  "among",
  "around",
  "at",
  "before",
  "behind",
  "below",
  "beneath",
  "beside",
  "between",
  "beyond",
  "by",
  "down",
  "during",
  "except",
  "for",
  "from",
  "in",
  "inside",
  "into",
  "like",
  "near",
  "of",
  "off",
  "on",
  "outside",
  "over",
  "since",
  "through",
  "throughout",
  "till",
  "to",
  "toward",
  "under",
  "until",
  "up",
  "upon",
  "with",
  "within",
  "without",

  // Question words
  "what",
  "when",
  "where",
  "why",
  "how",
  "who",
  "which",
  "whose",
  "whom",

  // Common abbreviations and acronyms
  "etc",
  "ie",
  "eg",
  "vs",
  "aka",
  "asap",
  "faq",
  "diy",
  "rip",
  "ps",
  "pps",
  "st",
  "nd",
  "rd",
  "th",
  "mr",
  "mrs",
  "ms",
  "dr",
  "prof",

  // Additional web/tech terms that should be filtered
  "click",
  "button",
  "link",
  "page",
  "site",
  "website",
  "web",
  "online",
  "internet",
  "email",
  "mail",
  "search",
  "google",
  "facebook",
  "twitter",
  "instagram",
  "youtube",
  "tiktok",
  "reddit",
  "linkedin",
  "snapchat",
  "whatsapp",
  "telegram",
  "discord",
  "slack",
  "zoom",
  "teams",
  "skype",

  // Common contractions (base forms)
  "dont",
  "doesnt",
  "didnt",
  "wont",
  "wouldnt",
  "couldnt",
  "shouldnt",
  "cant",
  "cannot",
  "isnt",
  "arent",
  "wasnt",
  "werent",
  "hasnt",
  "havent",
  "hadnt",
  "im",
  "youre",
  "hes",
  "shes",
  "its",
  "were",
  "theyre",
  "ive",
  "youve",
  "weve",
  "theyve",
  "ill",
  "youll",
  "hell",
  "shell",
  "well",
  "theyll",
  "id",
  "youd",
  "hed",
  "shed",
  "wed",
  "theyd",

  // Additional meaningless fragments often found in social media
  "gonna",
  "wanna",
  "gotta",
  "kinda",
  "sorta",
  "dunno",
  "lemme",
  "gimme",
  "cause",
  "cuz",
  "bout",
  "round",
  "til",
  "thru",
  "tho",
  "altho",
  "yep",
  "nope",
  "yup",
  "nah",
  "uh",
  "um",
  "er",
  "erm",
  "hmm",
  "meh",

  // Additional common words that add little value to word clouds
  "yeah",
  "okay",
  "ok",
  "yes",
  "no",
  "maybe",
  "sure",
  "fine",
  "good",
  "bad",
  "nice",
  "cool",
  "great",
  "awesome",
  "amazing",
  "terrible",
  "awful",
  "horrible",
  "perfect",
  "excellent",
  "wonderful",
  "fantastic",
  "incredible",
  "unbelievable",
  "thanks",
  "thank",
  "please",
  "welcome",
  "sorry",
  "excuse",
  "pardon",
  "hello",
  "hi",
  "hey",
  "bye",
  "goodbye",
  "morning",
  "afternoon",
  "evening",
  "night",
  "day",
  "week",
  "month",
  "year",
  "time",
  "moment",
  "second",
  "minute",
  "hour",

  // Additional modern internet slang and expressions
  "tbh",
  "ngl",
  "fr",
  "bruh",
  "bro",
  "sis",
  "fam",
  "bestie",
  "bestfriend",
  "periodt",
  "period",
  "facts",
  "cap",
  "nocap",
  "slay",
  "slayed",
  "king",
  "queen",
  "icon",
  "iconic",
  "legend",
  "legendary",
  "stan",
  "stans",
  "stanned",
  "vibe",
  "vibes",
  "vibing",
  "mood",
  "moods",
  "felt",
  "feel",
  "feels",
  "energy",
  "aura",
  "valid",
  "invalid",
  "lowkey",
  "highkey",
  "deadass",
  "straight",
  "literally",
  "figuratively",
  "basically",
  "honestly",
  "genuinely",
  "seriously",
  "actually",
  "truly",
  "really",
  "super",
  "hella",
  "mad",
  "crazy",
  "insane",
  "wild",
  "fire",
  "lit",
  "dope",
  "sick",
  "fresh",
  "clean",
  "smooth",
  "chill",
  "relax",
  "calm",
  "peace",
  "love",
  "hate",
  "like",
  "dislike",
  "enjoy",
  "fun",
  "funny",
  "lol",
  "lmao",
  "rofl",
  "lmfao",
  "haha",
  "hehe",
  "hahaha",
  "ahahaha",
  "ahaha",

  // Common reaction words
  "omg",
  "oh",
  "wow",
  "whoa",
  "damn",
  "dang",
  "shoot",
  "jeez",
  "gosh",
  "geez",
  "yikes",
  "oof",
  "bruh",
  "sheesh",
  "bet",
  "say",
  "word",
  "real",
  "true",
  "right",
  "exactly",
  "precisely",
  "correct",
  "wrong",
  "nope",
  "yep",
  "yeah",
  "yes",
  "no",
  "maybe",
  "perhaps",
  "possibly",
  "probably",
  "definitely",
  "absolutely",
  "totally",
  "completely",
  "entirely",
  "wholly",
  "fully",
  "quite",
  "rather",
  "pretty",
  "very",
  "extremely",
  "incredibly",
  "unbelievably",
  "remarkably",
  "exceptionally",
  "extraordinarily",
  "tremendously",
  "immensely",
  "enormously",
  "hugely",
  "massively",
  "greatly",
  "highly",
  "deeply",
  "strongly",
  "firmly",
  "solidly",

  // Additional social media terms
  "selfie",
  "pic",
  "picture",
  "photo",
  "image",
  "video",
  "clip",
  "story",
  "stories",
  "reel",
  "reels",
  "tiktok",
  "ig",
  "insta",
  "snap",
  "story",
  "dm",
  "dms",
  "slide",
  "sliding",
  "follow",
  "following",
  "follower",
  "followers",
  "unfollow",
  "block",
  "blocked",
  "mute",
  "muted",
  "report",
  "reported",
  "spam",
  "bot",
  "fake",
  "real",
  "verified",
  "check",
  "blue",
  "mark",
  "badge",
  "notification",
  "notifications",
  "alert",
  "alerts",
  "ping",
  "tagged",
  "mention",
  "mentioned",
  "reply",
  "replied",
  "quote",
  "quoted",
  "repost",
  "reposted",
  "share",
  "shared",
  "viral",
  "trending",
  "trend",
  "hashtag",
  "tag",
  "tagged",

  // Common filler and transition words
  "well",
  "so",
  "then",
  "now",
  "here",
  "there",
  "where",
  "everywhere",
  "somewhere",
  "anywhere",
  "nowhere",
  "when",
  "whenever",
  "sometime",
  "anytime",
  "always",
  "never",
  "sometimes",
  "often",
  "rarely",
  "seldom",
  "usually",
  "normally",
  "typically",
  "generally",
  "commonly",
  "frequently",
  "occasionally",
  "constantly",
  "continuously",
  "regularly",
  "irregularly",
  "sporadically",
  "intermittently",

  // Additional meaningless fragments
  "stuff",
  "things",
  "thing",
  "something",
  "anything",
  "everything",
  "nothing",
  "someone",
  "anyone",
  "everyone",
  "no one",
  "nobody",
  "somebody",
  "anybody",
  "everybody",
  "people",
  "person",
  "guy",
  "girl",
  "man",
  "woman",
  "boy",
  "girl",
  "kid",
  "child",
  "baby",
  "adult",
  "human",
  "humans",
  "folks",
  "folk",
  "peeps",
  "crew",
  "squad",
  "team",
  "group",
  "bunch",
  "lot",
  "lots",
  "many",
  "much",
  "more",
  "most",
  "less",
  "least",
  "few",
  "little",
  "bit",
  "piece",
  "part",
  "whole",
  "all",
  "some",
  "any",
  "every",
  "each",
  "both",
  "either",
  "neither",
  "other",
  "another",
  "same",
  "different",
  "various",
  "several",
]);
