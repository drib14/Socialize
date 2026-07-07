import React, { useState } from 'react'

const emojiCategories = [
  {
    category: "Smileys",
    icon: "😀",
    emojis: ["😀","😃","😄","😁","😆","😅","😂","🤣","😊","😇","🙂","🙃","😉","😌","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🥸","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🤗","🤔","🫣","🤭","🫢","🫡","🤫","🫠","🤥","😶","🫥","😐","😑","😬","🫨","😴","😷","🤒","🤕","🤢","🤮","🤧","😵","😵‍💫","🤠","🥳","🥸","😎","🤓","🧐","👽","👾","🤖","💀","☠️","👻"]
  },
  {
    category: "Gestures",
    icon: "👍",
    emojis: ["👋","🤚","🖐️","✋","🖖","👌","🤌","🤏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦾","🦵","🦿","🦶","👁️","👀","🧠","🫀","🫁","🦷","🦴"]
  },
  {
    category: "Nature",
    icon: "🐶",
    emojis: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐽","🐸","🐵","🙈","🙉","🙊","🐒","🐔","🐧","🐦","🐤","🐣","🐥","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🪱","🐛","🦋","🐌","🐞","🐜","🦟","🦗","🕷️","🕸️","🦂","🐢","🐍","🦎","🦖","🦕","🐙","🦑","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🐋","🦈","🐊"]
  },
  {
    category: "Food",
    icon: "🍔",
    emojis: ["🍏","🍎","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🍆","🥑","🥦","🥬","🌽","🥕","🍞","🥐","🥨","🧀","🥞","🧇","🥓","🥩","🍗","🍖","🍔","🍟","🍕","🌭","🥪","🌮","🌯","🍱","🍛","🍜","🍝","🍣","🍤","🥟","🍦","🍧","🍨","🍩","🍪","🎂","🍰","🍫","🍬","🍭","🍮","🍯","☕","🍵","🍶","🍷","🍸","🍹","🍺","🍻","🥂"]
  },
  {
    category: "Travel",
    icon: "🚗",
    emojis: ["⚽","🏀","🏈","⚾","🥎","🥎","🎾","🏐","🏉","🎱","🏓","🏸","🥅","⛳","🪁","🤿","🥊","🛹","🛼","⛷️","🏂","🪂","🏋️","🚴","🧗","🧘","🚗","🚕","🚙","🚌","🏎️","🚓","🤷","🚒","🚚","🚜","🛵","🏍️","🚲","🚨","🚥","🚦","🛑","🚧","✈️","🛳️","🌋","🏢","🏡"]
  },
  {
    category: "Symbols",
    icon: "❤️",
    emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","💔","🔥","✨","🌟","💯","👍","👎","👊","✊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","👋","👌","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","💪"]
  }
];

const emojiDict = [
  { emoji: "😀", name: "grinning smile happy face" },
  { emoji: "😃", name: "smiley happy grin face" },
  { emoji: "😄", name: "smile happy grin face" },
  { emoji: "😁", name: "grin proud teeth face" },
  { emoji: "😆", name: "laugh squint happy face" },
  { emoji: "😅", name: "sweat laugh relief face" },
  { emoji: "😂", name: "joy tears laugh face" },
  { emoji: "🤣", name: "rofl rolling laugh face" },
  { emoji: "😊", name: "blush smile happy face" },
  { emoji: "😇", name: "angel innocent halo face" },
  { emoji: "🙂", name: "slight smile face" },
  { emoji: "🙃", name: "upside down face" },
  { emoji: "😉", name: "wink face" },
  { emoji: "😌", name: "relieved calm face" },
  { emoji: "😍", name: "heart eyes love face" },
  { emoji: "🥰", name: "hearts love warm face" },
  { emoji: "😘", name: "kiss love blow face" },
  { emoji: "😋", name: "yum delicious food face" },
  { emoji: "😜", name: "tongue wink playful face" },
  { emoji: "🤪", name: "zany crazy face" },
  { emoji: "🤨", name: "raised eyebrow thinking face" },
  { emoji: "🧐", name: "monocle smart thinking face" },
  { emoji: "🤓", name: "nerd smart glasses face" },
  { emoji: "😎", name: "cool sunglasses face" },
  { emoji: "🥳", name: "party celebrate face" },
  { emoji: "😏", name: "smirk sly face" },
  { emoji: "😒", name: "unamused annoyed face" },
  { emoji: "😞", name: "disappointed sad face" },
  { emoji: "😔", name: "pensive sad face" },
  { emoji: "😟", name: "worried anxious face" },
  { emoji: "😕", name: "confused puzzle face" },
  { emoji: "☹️", name: "frown sad face" },
  { emoji: "🥺", name: "pleading begging puppy eyes face" },
  { emoji: "😢", name: "cry sad tear face" },
  { emoji: "😭", name: "loud crying sad tears face" },
  { emoji: "😤", name: "triumph angry steam face" },
  { emoji: "😠", name: "angry mad face" },
  { emoji: "😡", name: "pout angry mad red face" },
  { emoji: "🤬", name: "cursing swearing mad face" },
  { emoji: "🤯", name: "mindblown explode head face" },
  { emoji: "😳", name: "flushed embarrassed surprised face" },
  { emoji: "🥵", name: "hot sweat red face" },
  { emoji: "🥶", name: "cold blue ice face" },
  { emoji: "😱", name: "scream fear gasp face" },
  { emoji: "😨", name: "fear scared face" },
  { emoji: "😰", name: "anxious blue sweat face" },
  { emoji: "😥", name: "sad sweat relief face" },
  { emoji: "😓", name: "cold sweat sad face" },
  { emoji: "🤔", name: "thinking ponder question face" },
  { emoji: "🫣", name: "peeking fear face" },
  { emoji: "🤫", name: "shush quiet silence face" },
  { emoji: "🫠", name: "melting smile hot face" },
  { emoji: "😐", name: "neutral meh blank face" },
  { emoji: "😑", name: "expressionless blank face" },
  { emoji: "😬", name: "grimace tense teeth face" },
  { emoji: "😴", name: "sleep sleepy tired zzz face" },
  { emoji: "🥱", name: "yawn tired sleepy face" },
  { emoji: "😷", name: "mask sick doctor face" },
  { emoji: "🤒", name: "thermometer sick ill face" },
  { emoji: "🤕", name: "bandage hurt head face" },
  { emoji: "🤢", name: "nausea green sick vomit face" },
  { emoji: "🤮", name: "vomit sick spew face" },
  { emoji: "🥴", name: "woozy drunk dizzy face" },
  { emoji: "😵", name: "dizzy cross-eyed dead face" },
  { emoji: "💀", name: "skull dead skeleton" },
  { emoji: "Poop", name: "poop turd smile" },
  { emoji: "🤡", name: "clown circus joker" },
  { emoji: "👻", name: "ghost spooky halloween" },
  { emoji: "👽", name: "alien space ufo" },
  { emoji: "👾", name: "monster game retro" },
  { emoji: "🤖", name: "robot bot mechanical" },
  { emoji: "❤️", name: "heart love red" },
  { emoji: "🧡", name: "heart love orange" },
  { emoji: "💛", name: "heart love yellow" },
  { emoji: "💚", name: "heart love green" },
  { emoji: "💙", name: "heart love blue" },
  { emoji: "💜", name: "heart love purple" },
  { emoji: "🖤", name: "heart love black" },
  { emoji: "🤍", name: "heart love white" },
  { emoji: "💔", name: "broken heart love sad" },
  { emoji: "🔥", name: "fire hot flame burn cool" },
  { emoji: "✨", name: "sparkles shine bright stars" },
  { emoji: "🌟", name: "star shine bright gold" },
  { emoji: "💯", name: "hundred 100 perfect score" },
  { emoji: "👍", name: "thumbs up like yes agree" },
  { emoji: "👎", name: "thumbs down dislike no" },
  { emoji: "👊", name: "fist punch bump" },
  { emoji: "✊", name: "fist raise power" },
  { emoji: "🤛", name: "left fist bump" },
  { emoji: "🤜", name: "right fist bump" },
  { emoji: "👏", name: "clap applaud hands" },
  { emoji: "🙌", name: "raising hands celebrate" },
  { emoji: "👐", name: "open hands" },
  { emoji: "🤲", name: "palms together pray ask" },
  { emoji: "🤝", name: "handshake agree deal partner" },
  { emoji: "🙏", name: "pray please thanks folded hands" },
  { emoji: "👋", name: "wave hello goodbye hi" },
  { emoji: "👌", name: "ok fine perfect hand" },
  { emoji: "✌️", name: "peace victory hand" },
  { emoji: "🤞", name: "crossed fingers luck promise" },
  { emoji: "🤟", name: "love hand rock" },
  { emoji: "🤘", name: "rock metal horns hand" },
  { emoji: "💪", name: "muscle strong power bicep" },
  { emoji: "🎉", name: "party popper celebrate" },
  { emoji: "🎊", name: "ball celebrate party" },
  { emoji: "🎈", name: "balloon red party" },
  { emoji: "🎂", name: "cake birthday sweet" },
  { emoji: "🍺", name: "beer drink alcohol mug" },
  { emoji: "🍻", name: "beers cheers drink alcohol" },
  { emoji: "🥂", name: "champagne cheers toast" },
  { emoji: "🍷", name: "wine glass alcohol drink" },
  { emoji: "☕", name: "coffee tea hot drink cup" },
  { emoji: "🍕", name: "pizza food cheese" },
  { emoji: "🍔", name: "burger food beef" },
  { emoji: "🍟", name: "fries food potato" },
  { emoji: "🌮", name: "taco food mexican" },
  { emoji: "🍣", name: "sushi food japanese" },
  { emoji: "🍩", name: "donut sweet dessert" },
  { emoji: "🍪", name: "cookie sweet dessert chocolate" },
  { emoji: "🍫", name: "chocolate sweet candy" },
  { emoji: "🍭", name: "lollipop candy sweet" },
  { emoji: "🚀", name: "rocket space launch speed" },
  { emoji: "💡", name: "idea bulb light intelligence" },
  { emoji: "💻", name: "computer laptop screen tech" },
  { emoji: "📱", name: "phone mobile screen cell" },
  { emoji: "💵", name: "money cash dollar bills" },
  { emoji: "💰", name: "money bag cash wealth" },
  { emoji: "👑", name: "crown king queen royal" },
  { emoji: "🐶", name: "dog puppy animal pet" },
  { emoji: "🐱", name: "cat kitten animal pet" },
  { emoji: "🦁", name: "lion wild animal predator" },
  { emoji: "🦄", name: "unicorn magic fantasy" },
  { emoji: "🌈", name: "rainbow sky weather colors" },
  { emoji: "☀️", name: "sun sunny hot weather" },
  { emoji: "⭐", name: "star gold bright" },
  { emoji: "🎵", name: "music note sound song" },
  { emoji: "🎶", name: "music notes sound songs" }
];

const Icons = ({setContent, content, theme}) => {
    const [search, setSearch] = useState('')
    const [activeTab, setActiveTab] = useState('Smileys')

    const handleEmojiClick = (emoji) => {
        setContent(content + emoji)
    }

    const filteredEmojis = search.trim() 
        ? emojiDict.filter(item => item.name.includes(search.toLowerCase().trim())).map(item => item.emoji)
        : emojiCategories.find(cat => cat.category === activeTab)?.emojis || []

    return (
        <div className="nav-item dropdown" style={{ opacity: 1 }}>
            <span className="nav-link position-relative px-1" id="navbarDropdown" 
            role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
            style={{ cursor: 'pointer' }}>
                <span style={{ fontSize: '1.4rem' }}>😄</span>
            </span>

            <div className="dropdown-menu emoji_picker_dropdown p-2" aria-labelledby="navbarDropdown" onClick={(e) => e.stopPropagation()}>
                <input 
                    type="text" 
                    className="emoji_picker_search" 
                    placeholder="Search emoji..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />

                {
                    !search.trim() && (
                        <div className="emoji_picker_tabs">
                            {
                                emojiCategories.map(cat => (
                                    <button 
                                        key={cat.category}
                                        type="button"
                                        className={`emoji_picker_tab_btn ${activeTab === cat.category ? 'active' : ''}`}
                                        onClick={() => setActiveTab(cat.category)}
                                    >
                                        <span className="mr-1">{cat.icon}</span>
                                        {cat.category}
                                    </button>
                                ))
                            }
                        </div>
                    )
                }

                <div className="emoji_picker_grid">
                    {
                        filteredEmojis.length > 0 
                        ? filteredEmojis.map((emoji, index) => (
                            <span 
                                key={index} 
                                className="emoji_picker_item"
                                onClick={() => handleEmojiClick(emoji)}
                            >
                                {emoji}
                            </span>
                          ))
                        : <div className="emoji_picker_no_results">No emojis found</div>
                    }
                </div>
            </div>
        </div>
    )
}

export default Icons
