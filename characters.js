// STEM Quest Character System
// Cute illustrated characters with expressions and personality

const CHARACTERS = {
    robot: {
        id: 'robot',
        name: 'Byte',
        tagline: 'Logic whiz!',
        color: '#74B9FF',
        colorLight: '#D6EEFF',
        personality: 'analytical',
        svg: `<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Antenna -->
            <line x1="60" y1="8" x2="60" y2="24" stroke="#636E72" stroke-width="3" stroke-linecap="round"/>
            <circle cx="60" cy="6" r="5" fill="#74B9FF">
                <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/>
            </circle>
            <!-- Head -->
            <rect x="25" y="24" width="70" height="55" rx="12" fill="#74B9FF"/>
            <rect x="30" y="29" width="60" height="45" rx="8" fill="#D6EEFF"/>
            <!-- Eyes -->
            <g class="char-eyes">
                <circle cx="44" cy="50" r="8" fill="white"/>
                <circle cx="76" cy="50" r="8" fill="white"/>
                <circle cx="46" cy="50" r="4" fill="#2D3436"/>
                <circle cx="78" cy="50" r="4" fill="#2D3436"/>
                <circle cx="47" cy="48" r="1.5" fill="white"/>
                <circle cx="79" cy="48" r="1.5" fill="white"/>
            </g>
            <!-- Mouth -->
            <g class="char-mouth">
                <rect x="44" y="62" width="32" height="4" rx="2" fill="#636E72"/>
            </g>
            <!-- Body -->
            <rect x="30" y="84" width="60" height="50" rx="10" fill="#74B9FF"/>
            <rect x="38" y="92" width="44" height="34" rx="6" fill="#D6EEFF"/>
            <!-- Screen on body -->
            <rect x="44" y="98" width="32" height="20" rx="4" fill="#74B9FF" opacity="0.5"/>
            <text x="60" y="112" text-anchor="middle" fill="white" font-size="10" font-weight="bold">01</text>
            <!-- Arms -->
            <rect x="12" y="90" width="16" height="8" rx="4" fill="#74B9FF"/>
            <rect x="92" y="90" width="16" height="8" rx="4" fill="#74B9FF"/>
            <!-- Legs -->
            <rect x="38" y="134" width="14" height="16" rx="5" fill="#636E72"/>
            <rect x="68" y="134" width="14" height="16" rx="5" fill="#636E72"/>
            <!-- Feet -->
            <rect x="34" y="146" width="22" height="8" rx="4" fill="#636E72"/>
            <rect x="64" y="146" width="22" height="8" rx="4" fill="#636E72"/>
        </svg>`,
        expressions: {
            neutral: {
                eyes: `<circle cx="44" cy="50" r="8" fill="white"/><circle cx="76" cy="50" r="8" fill="white"/><circle cx="46" cy="50" r="4" fill="#2D3436"/><circle cx="78" cy="50" r="4" fill="#2D3436"/><circle cx="47" cy="48" r="1.5" fill="white"/><circle cx="79" cy="48" r="1.5" fill="white"/>`,
                mouth: `<rect x="44" y="62" width="32" height="4" rx="2" fill="#636E72"/>`
            },
            happy: {
                eyes: `<circle cx="44" cy="50" r="8" fill="white"/><circle cx="76" cy="50" r="8" fill="white"/><circle cx="46" cy="48" r="5" fill="#2D3436"/><circle cx="78" cy="48" r="5" fill="#2D3436"/><circle cx="48" cy="46" r="2" fill="white"/><circle cx="80" cy="46" r="2" fill="white"/>`,
                mouth: `<path d="M44 62 Q60 74 76 62" stroke="#636E72" stroke-width="3" fill="none" stroke-linecap="round"/>`
            },
            thinking: {
                eyes: `<circle cx="44" cy="50" r="8" fill="white"/><circle cx="76" cy="50" r="8" fill="white"/><circle cx="48" cy="50" r="4" fill="#2D3436"/><circle cx="80" cy="50" r="4" fill="#2D3436"/><circle cx="49" cy="48" r="1.5" fill="white"/><circle cx="81" cy="48" r="1.5" fill="white"/>`,
                mouth: `<circle cx="64" cy="65" r="4" fill="#636E72" opacity="0.5"/>`
            },
            sad: {
                eyes: `<circle cx="44" cy="50" r="8" fill="white"/><circle cx="76" cy="50" r="8" fill="white"/><circle cx="46" cy="52" r="4" fill="#2D3436"/><circle cx="78" cy="52" r="4" fill="#2D3436"/>`,
                mouth: `<path d="M44 68 Q60 60 76 68" stroke="#636E72" stroke-width="3" fill="none" stroke-linecap="round"/>`
            },
            excited: {
                eyes: `<circle cx="44" cy="50" r="9" fill="white"/><circle cx="76" cy="50" r="9" fill="white"/><circle cx="46" cy="48" r="5" fill="#2D3436"/><circle cx="78" cy="48" r="5" fill="#2D3436"/><circle cx="48" cy="46" r="2.5" fill="white"/><circle cx="80" cy="46" r="2.5" fill="white"/><path d="M36 38 L42 42" stroke="#74B9FF" stroke-width="2" stroke-linecap="round"/><path d="M84 38 L78 42" stroke="#74B9FF" stroke-width="2" stroke-linecap="round"/>`,
                mouth: `<ellipse cx="60" cy="66" rx="10" ry="6" fill="#636E72"/><ellipse cx="60" cy="64" rx="8" ry="3" fill="white"/>`
            }
        },
        messages: {
            greeting: [
                "Beep boop! Let's compute some answers!",
                "Initializing quiz mode... Ready!",
                "My circuits are ready for action!"
            ],
            correct: [
                "Correct! My circuits are buzzing!",
                "Logical! Well calculated!",
                "Processing... Result: AWESOME!",
                "That computes perfectly!"
            ],
            wrong: [
                "Error detected. Let's debug that!",
                "Recalibrating... Try again!",
                "Bug found! We can fix this!"
            ],
            retry: [
                "Running diagnostics... one more try!",
                "Rebooting answer module..."
            ],
            streak3: [
                "Processing power at 300%!",
                "You're overclocking my circuits!"
            ],
            streak5: [
                "MAXIMUM COMPUTE ACHIEVED!",
                "You're a supercomputer!"
            ],
            encouragement: [
                "Every error is just data. Keep going!",
                "Reboot and retry - that's the way!"
            ],
            complete: [
                "Quiz.exe completed successfully!",
                "Final score computed! Great work!"
            ],
            levelUp: [
                "System upgrade complete!",
                "Processing power increased!"
            ]
        },
        categoryHints: {
            maths: "Computing variables...",
            science: "Scanning data banks...",
            riddles: "Processing logic puzzle...",
            spelling: "Checking dictionary module...",
            india: "Searching geography database..."
        }
    },

    astronaut: {
        id: 'astronaut',
        name: 'Nova',
        tagline: 'Star explorer!',
        color: '#A29BFE',
        colorLight: '#E4E0FF',
        personality: 'adventurous',
        svg: `<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Helmet glow -->
            <circle cx="60" cy="48" r="38" fill="#E4E0FF" opacity="0.3"/>
            <!-- Helmet -->
            <circle cx="60" cy="48" r="34" fill="#E4E0FF" stroke="#A29BFE" stroke-width="3"/>
            <!-- Visor -->
            <ellipse cx="60" cy="50" rx="24" ry="22" fill="#2D3436"/>
            <!-- Visor reflection -->
            <ellipse cx="52" cy="42" rx="8" ry="5" fill="white" opacity="0.15" transform="rotate(-20 52 42)"/>
            <!-- Eyes -->
            <g class="char-eyes">
                <circle cx="48" cy="50" r="5" fill="white"/>
                <circle cx="72" cy="50" r="5" fill="white"/>
                <circle cx="49" cy="49" r="2.5" fill="white"/>
                <circle cx="73" cy="49" r="2.5" fill="white"/>
            </g>
            <!-- Mouth -->
            <g class="char-mouth">
                <path d="M50 60 Q60 66 70 60" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
            </g>
            <!-- Body (spacesuit) -->
            <rect x="30" y="84" width="60" height="48" rx="14" fill="white" stroke="#A29BFE" stroke-width="2"/>
            <!-- Chest panel -->
            <rect x="42" y="92" width="36" height="24" rx="6" fill="#E4E0FF"/>
            <circle cx="52" cy="104" r="4" fill="#A29BFE"/>
            <circle cx="68" cy="104" r="4" fill="#FF6B9D"/>
            <circle cx="60" cy="96" r="3" fill="#55EFC4">
                <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
            </circle>
            <!-- Arms -->
            <ellipse cx="20" cy="100" rx="12" ry="8" fill="white" stroke="#A29BFE" stroke-width="2"/>
            <ellipse cx="100" cy="100" rx="12" ry="8" fill="white" stroke="#A29BFE" stroke-width="2"/>
            <!-- Star patches -->
            <polygon points="104,94 106,98 110,98 107,101 108,105 104,102 100,105 101,101 98,98 102,98" fill="#FFEAA7" opacity="0.8"/>
            <!-- Legs -->
            <rect x="36" y="130" width="16" height="18" rx="6" fill="white" stroke="#A29BFE" stroke-width="2"/>
            <rect x="68" y="130" width="16" height="18" rx="6" fill="white" stroke="#A29BFE" stroke-width="2"/>
            <!-- Boots -->
            <rect x="32" y="144" width="24" height="10" rx="5" fill="#A29BFE"/>
            <rect x="64" y="144" width="24" height="10" rx="5" fill="#A29BFE"/>
        </svg>`,
        expressions: {
            neutral: {
                eyes: `<circle cx="48" cy="50" r="5" fill="white"/><circle cx="72" cy="50" r="5" fill="white"/><circle cx="49" cy="49" r="2.5" fill="white"/><circle cx="73" cy="49" r="2.5" fill="white"/>`,
                mouth: `<path d="M50 60 Q60 66 70 60" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>`
            },
            happy: {
                eyes: `<circle cx="48" cy="48" r="6" fill="white"/><circle cx="72" cy="48" r="6" fill="white"/><circle cx="50" cy="47" r="3" fill="white" opacity="0.8"/>< circle cx="74" cy="47" r="3" fill="white" opacity="0.8"/>`,
                mouth: `<path d="M48 58 Q60 70 72 58" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
            },
            thinking: {
                eyes: `<circle cx="48" cy="50" r="5" fill="white"/><circle cx="72" cy="50" r="5" fill="white"/><circle cx="50" cy="50" r="2.5" fill="white"/><circle cx="74" cy="50" r="2.5" fill="white"/>`,
                mouth: `<ellipse cx="65" cy="62" rx="4" ry="3" fill="white" opacity="0.5"/>`
            },
            sad: {
                eyes: `<circle cx="48" cy="52" r="4" fill="white"/><circle cx="72" cy="52" r="4" fill="white"/>`,
                mouth: `<path d="M50 64 Q60 58 70 64" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>`
            },
            excited: {
                eyes: `<circle cx="48" cy="48" r="7" fill="white"/><circle cx="72" cy="48" r="7" fill="white"/><circle cx="50" cy="46" r="3.5" fill="white" opacity="0.8"/><circle cx="74" cy="46" r="3.5" fill="white" opacity="0.8"/><line x1="40" y1="38" x2="44" y2="42" stroke="#FFEAA7" stroke-width="2" stroke-linecap="round"/><line x1="80" y1="38" x2="76" y2="42" stroke="#FFEAA7" stroke-width="2" stroke-linecap="round"/>`,
                mouth: `<ellipse cx="60" cy="62" rx="8" ry="5" fill="white"/>`
            }
        },
        messages: {
            greeting: [
                "3... 2... 1... Blastoff! Let's explore!",
                "Houston, we have a quiz! Let's go!",
                "Ready to explore the stars of knowledge!"
            ],
            correct: [
                "That's out of this world!",
                "Stellar answer, space cadet!",
                "You're a star! Literally!",
                "Mission success!"
            ],
            wrong: [
                "Even astronauts miss sometimes. Try again!",
                "Let's adjust our trajectory!",
                "Minor turbulence - we'll get through it!"
            ],
            retry: [
                "Recalculating orbit... one more shot!",
                "Second stage boost - go!"
            ],
            streak3: [
                "You're in orbit now!",
                "Reaching escape velocity!"
            ],
            streak5: [
                "INTERSTELLAR ACHIEVEMENT!",
                "You've gone to infinity and beyond!"
            ],
            encouragement: [
                "Space is hard, but you're a natural!",
                "Keep reaching for the stars!"
            ],
            complete: [
                "Mission accomplished, astronaut!",
                "Welcome back to Earth, champion!"
            ],
            levelUp: [
                "We've reached a new orbit!",
                "Altitude increasing!"
            ]
        },
        categoryHints: {
            maths: "Calculating trajectory...",
            science: "Analyzing star charts...",
            riddles: "Decoding space signal...",
            spelling: "Checking mission log...",
            india: "Scanning Earth below..."
        }
    },

    scientist: {
        id: 'scientist',
        name: 'Dr. Eureka',
        tagline: 'Lab genius!',
        color: '#55EFC4',
        colorLight: '#D5FFF0',
        personality: 'curious',
        svg: `<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Hair -->
            <path d="M28 45 Q20 20 40 18 Q50 5 65 10 Q85 5 90 25 Q100 30 95 50" fill="#636E72" stroke="#2D3436" stroke-width="1"/>
            <path d="M30 35 Q35 25 42 30" stroke="#2D3436" stroke-width="2" fill="none"/>
            <path d="M85 30 Q90 22 95 32" stroke="#2D3436" stroke-width="2" fill="none"/>
            <!-- Head -->
            <ellipse cx="60" cy="48" rx="30" ry="32" fill="#FFEAA7"/>
            <!-- Glasses -->
            <circle cx="46" cy="46" r="12" fill="none" stroke="#2D3436" stroke-width="2.5"/>
            <circle cx="76" cy="46" r="12" fill="none" stroke="#2D3436" stroke-width="2.5"/>
            <line x1="58" y1="46" x2="64" y2="46" stroke="#2D3436" stroke-width="2.5"/>
            <line x1="34" y1="44" x2="28" y2="40" stroke="#2D3436" stroke-width="2"/>
            <line x1="88" y1="44" x2="94" y2="40" stroke="#2D3436" stroke-width="2"/>
            <!-- Eyes (behind glasses) -->
            <g class="char-eyes">
                <circle cx="46" cy="46" r="4" fill="#2D3436"/>
                <circle cx="76" cy="46" r="4" fill="#2D3436"/>
                <circle cx="47.5" cy="44.5" r="1.5" fill="white"/>
                <circle cx="77.5" cy="44.5" r="1.5" fill="white"/>
            </g>
            <!-- Mouth -->
            <g class="char-mouth">
                <path d="M50 62 Q60 68 70 62" stroke="#2D3436" stroke-width="2" fill="none" stroke-linecap="round"/>
            </g>
            <!-- Lab coat -->
            <path d="M28 82 L28 138 L50 138 L50 110 L70 110 L70 138 L92 138 L92 82 Q60 78 28 82Z" fill="white" stroke="#B2BEC3" stroke-width="1.5"/>
            <!-- Coat collar -->
            <path d="M42 82 L52 95 L60 88 L68 95 L78 82" fill="none" stroke="#B2BEC3" stroke-width="1.5"/>
            <!-- Shirt underneath -->
            <rect x="48" y="94" width="24" height="16" rx="3" fill="#55EFC4"/>
            <!-- Pocket with pens -->
            <rect x="72" y="100" width="14" height="16" rx="2" fill="none" stroke="#B2BEC3" stroke-width="1"/>
            <line x1="76" y1="96" x2="76" y2="102" stroke="#E17055" stroke-width="2" stroke-linecap="round"/>
            <line x1="80" y1="97" x2="80" y2="102" stroke="#74B9FF" stroke-width="2" stroke-linecap="round"/>
            <!-- Arms -->
            <rect x="10" y="88" width="18" height="10" rx="5" fill="white" stroke="#B2BEC3" stroke-width="1"/>
            <rect x="92" y="88" width="18" height="10" rx="5" fill="white" stroke="#B2BEC3" stroke-width="1"/>
            <!-- Hands -->
            <circle cx="10" cy="93" r="6" fill="#FFEAA7"/>
            <circle cx="110" cy="93" r="6" fill="#FFEAA7"/>
            <!-- Test tube in hand -->
            <rect x="106" y="78" width="6" height="22" rx="3" fill="none" stroke="#55EFC4" stroke-width="1.5"/>
            <rect x="107" y="88" width="4" height="10" rx="2" fill="#55EFC4" opacity="0.5"/>
            <!-- Shoes -->
            <rect x="30" y="138" width="20" height="10" rx="5" fill="#2D3436"/>
            <rect x="70" y="138" width="20" height="10" rx="5" fill="#2D3436"/>
        </svg>`,
        expressions: {
            neutral: {
                eyes: `<circle cx="46" cy="46" r="4" fill="#2D3436"/><circle cx="76" cy="46" r="4" fill="#2D3436"/><circle cx="47.5" cy="44.5" r="1.5" fill="white"/><circle cx="77.5" cy="44.5" r="1.5" fill="white"/>`,
                mouth: `<path d="M50 62 Q60 68 70 62" stroke="#2D3436" stroke-width="2" fill="none" stroke-linecap="round"/>`
            },
            happy: {
                eyes: `<path d="M40 46 Q46 40 52 46" stroke="#2D3436" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M70 46 Q76 40 82 46" stroke="#2D3436" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
                mouth: `<path d="M46 60 Q60 74 74 60" stroke="#2D3436" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
            },
            thinking: {
                eyes: `<circle cx="46" cy="46" r="4" fill="#2D3436"/><circle cx="76" cy="44" r="4" fill="#2D3436"/><circle cx="47.5" cy="44.5" r="1.5" fill="white"/><circle cx="77.5" cy="42.5" r="1.5" fill="white"/>`,
                mouth: `<path d="M54 64 Q58 62 62 64" stroke="#2D3436" stroke-width="2" fill="none" stroke-linecap="round"/>`
            },
            sad: {
                eyes: `<circle cx="46" cy="48" r="3.5" fill="#2D3436"/><circle cx="76" cy="48" r="3.5" fill="#2D3436"/>`,
                mouth: `<path d="M50 66 Q60 60 70 66" stroke="#2D3436" stroke-width="2" fill="none" stroke-linecap="round"/>`
            },
            excited: {
                eyes: `<circle cx="46" cy="44" r="5" fill="#2D3436"/><circle cx="76" cy="44" r="5" fill="#2D3436"/><circle cx="48" cy="42" r="2" fill="white"/><circle cx="78" cy="42" r="2" fill="white"/><line x1="38" y1="34" x2="42" y2="38" stroke="#55EFC4" stroke-width="2" stroke-linecap="round"/><line x1="54" y1="32" x2="52" y2="37" stroke="#55EFC4" stroke-width="2" stroke-linecap="round"/><line x1="82" y1="34" x2="80" y2="38" stroke="#55EFC4" stroke-width="2" stroke-linecap="round"/>`,
                mouth: `<ellipse cx="60" cy="64" rx="10" ry="7" fill="#2D3436"/><ellipse cx="60" cy="62" rx="7" ry="3" fill="#FF6B9D"/>`
            }
        },
        messages: {
            greeting: [
                "Hypothesis: You're going to ace this!",
                "Let's experiment with some questions!",
                "The lab is open! Let's discover answers!"
            ],
            correct: [
                "Eureka! That's the right formula!",
                "Hypothesis confirmed! Brilliant!",
                "Your experiment was a success!",
                "The data supports your answer!"
            ],
            wrong: [
                "Interesting result! Let's test again!",
                "Every failed experiment teaches us!",
                "Back to the lab - we'll figure it out!"
            ],
            retry: [
                "Adjusting the variables... try again!",
                "New hypothesis forming..."
            ],
            streak3: [
                "Your results are reproducible!",
                "That's peer-review worthy!"
            ],
            streak5: [
                "NOBEL PRIZE MATERIAL!",
                "You've made a breakthrough discovery!"
            ],
            encouragement: [
                "Science is all about trying! Keep at it!",
                "The best discoveries come from persistence!"
            ],
            complete: [
                "Lab report complete! Outstanding work!",
                "Experiment concluded - brilliant results!"
            ],
            levelUp: [
                "Advanced experiments unlocked!",
                "New research level!"
            ]
        },
        categoryHints: {
            maths: "Running the formula...",
            science: "Hypothesis forming...",
            riddles: "Curious pattern detected...",
            spelling: "Consulting the textbook...",
            india: "Reviewing field notes..."
        }
    },

    explorer: {
        id: 'explorer',
        name: 'Atlas',
        tagline: 'Trail blazer!',
        color: '#FDCB6E',
        colorLight: '#FFF3D4',
        personality: 'brave',
        svg: `<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Safari hat -->
            <ellipse cx="60" cy="28" rx="40" ry="8" fill="#DFB46D"/>
            <path d="M32 28 Q32 8 60 6 Q88 8 88 28" fill="#E8C97A"/>
            <rect x="40" y="22" width="40" height="6" rx="2" fill="#C9A45C"/>
            <!-- Head -->
            <ellipse cx="60" cy="48" rx="26" ry="28" fill="#FFEAA7"/>
            <!-- Freckles -->
            <circle cx="42" cy="54" r="2" fill="#E8C97A"/>
            <circle cx="46" cy="58" r="1.5" fill="#E8C97A"/>
            <circle cx="78" cy="54" r="2" fill="#E8C97A"/>
            <circle cx="74" cy="58" r="1.5" fill="#E8C97A"/>
            <!-- Eyes -->
            <g class="char-eyes">
                <circle cx="48" cy="46" r="6" fill="white"/>
                <circle cx="72" cy="46" r="6" fill="white"/>
                <circle cx="50" cy="46" r="3" fill="#6C5CE7"/>
                <circle cx="74" cy="46" r="3" fill="#6C5CE7"/>
                <circle cx="51" cy="44.5" r="1.5" fill="white"/>
                <circle cx="75" cy="44.5" r="1.5" fill="white"/>
            </g>
            <!-- Mouth -->
            <g class="char-mouth">
                <path d="M50 60 Q60 68 70 60" stroke="#2D3436" stroke-width="2" fill="none" stroke-linecap="round"/>
            </g>
            <!-- Bandana/scarf -->
            <path d="M34 72 Q60 80 86 72 L84 82 Q60 88 36 82Z" fill="#E17055"/>
            <path d="M48 78 L42 90" stroke="#C0392B" stroke-width="1.5"/>
            <path d="M72 78 L78 90" stroke="#C0392B" stroke-width="1.5"/>
            <!-- Body (vest) -->
            <rect x="32" y="82" width="56" height="46" rx="10" fill="#55A67E"/>
            <!-- Vest details -->
            <rect x="32" y="82" width="24" height="46" rx="10" fill="#4A9670"/>
            <rect x="64" y="82" width="24" height="46" rx="10" fill="#4A9670"/>
            <!-- Shirt -->
            <rect x="44" y="82" width="32" height="46" rx="6" fill="#FFEAA7" opacity="0.3"/>
            <!-- Pockets -->
            <rect x="36" y="100" width="16" height="14" rx="3" fill="none" stroke="#3D8B5F" stroke-width="1.5"/>
            <rect x="68" y="100" width="16" height="14" rx="3" fill="none" stroke="#3D8B5F" stroke-width="1.5"/>
            <!-- Binoculars around neck -->
            <ellipse cx="50" cy="86" rx="6" ry="4" fill="#636E72"/>
            <ellipse cx="62" cy="86" rx="6" ry="4" fill="#636E72"/>
            <rect x="50" y="82" width="12" height="4" rx="2" fill="#636E72"/>
            <!-- Arms -->
            <rect x="14" y="88" width="18" height="10" rx="5" fill="#55A67E"/>
            <rect x="88" y="88" width="18" height="10" rx="5" fill="#55A67E"/>
            <!-- Hands -->
            <circle cx="14" cy="93" r="6" fill="#FFEAA7"/>
            <circle cx="106" cy="93" r="6" fill="#FFEAA7"/>
            <!-- Shorts -->
            <rect x="36" y="128" width="20" height="12" rx="4" fill="#C9A45C"/>
            <rect x="64" y="128" width="20" height="12" rx="4" fill="#C9A45C"/>
            <!-- Boots -->
            <rect x="34" y="140" width="22" height="14" rx="5" fill="#8B6914"/>
            <rect x="64" y="140" width="22" height="14" rx="5" fill="#8B6914"/>
            <!-- Boot laces -->
            <line x1="40" y1="144" x2="50" y2="144" stroke="#C9A45C" stroke-width="1"/>
            <line x1="70" y1="144" x2="80" y2="144" stroke="#C9A45C" stroke-width="1"/>
        </svg>`,
        expressions: {
            neutral: {
                eyes: `<circle cx="48" cy="46" r="6" fill="white"/><circle cx="72" cy="46" r="6" fill="white"/><circle cx="50" cy="46" r="3" fill="#6C5CE7"/><circle cx="74" cy="46" r="3" fill="#6C5CE7"/><circle cx="51" cy="44.5" r="1.5" fill="white"/><circle cx="75" cy="44.5" r="1.5" fill="white"/>`,
                mouth: `<path d="M50 60 Q60 68 70 60" stroke="#2D3436" stroke-width="2" fill="none" stroke-linecap="round"/>`
            },
            happy: {
                eyes: `<path d="M42 46 Q48 38 54 46" stroke="#6C5CE7" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M66 46 Q72 38 78 46" stroke="#6C5CE7" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
                mouth: `<path d="M46 58 Q60 72 74 58" stroke="#2D3436" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
            },
            thinking: {
                eyes: `<circle cx="48" cy="46" r="6" fill="white"/><circle cx="72" cy="46" r="6" fill="white"/><circle cx="52" cy="46" r="3" fill="#6C5CE7"/><circle cx="76" cy="46" r="3" fill="#6C5CE7"/><circle cx="53" cy="44.5" r="1.5" fill="white"/><circle cx="77" cy="44.5" r="1.5" fill="white"/>`,
                mouth: `<path d="M54 62 L66 62" stroke="#2D3436" stroke-width="2" stroke-linecap="round"/>`
            },
            sad: {
                eyes: `<circle cx="48" cy="48" r="5" fill="white"/><circle cx="72" cy="48" r="5" fill="white"/><circle cx="50" cy="48" r="2.5" fill="#6C5CE7"/><circle cx="74" cy="48" r="2.5" fill="#6C5CE7"/>`,
                mouth: `<path d="M50 64 Q60 58 70 64" stroke="#2D3436" stroke-width="2" fill="none" stroke-linecap="round"/>`
            },
            excited: {
                eyes: `<circle cx="48" cy="44" r="7" fill="white"/><circle cx="72" cy="44" r="7" fill="white"/><circle cx="50" cy="43" r="4" fill="#6C5CE7"/><circle cx="74" cy="43" r="4" fill="#6C5CE7"/><circle cx="52" cy="41" r="2" fill="white"/><circle cx="76" cy="41" r="2" fill="white"/>`,
                mouth: `<ellipse cx="60" cy="62" rx="10" ry="7" fill="#2D3436"/><path d="M52 62 Q60 58 68 62" fill="#FF6B9D"/>`
            }
        },
        messages: {
            greeting: [
                "Adventure awaits! Let's explore!",
                "Map is ready, compass set! Let's go!",
                "Time to discover something amazing!"
            ],
            correct: [
                "X marks the spot! You found it!",
                "Treasure discovered! Great job!",
                "You're a true pathfinder!",
                "That's the right trail!"
            ],
            wrong: [
                "Wrong path, but every explorer gets lost!",
                "Let's check the map again!",
                "Detour! We'll find the way!"
            ],
            retry: [
                "New path ahead - try this way!",
                "Adjusting the compass..."
            ],
            streak3: [
                "You're blazing a trail!",
                "Nothing can stop this explorer!"
            ],
            streak5: [
                "LEGENDARY EXPLORER STATUS!",
                "You've conquered the whole map!"
            ],
            encouragement: [
                "The best explorers never give up!",
                "Keep trekking - the summit is near!"
            ],
            complete: [
                "Expedition complete! What a journey!",
                "You've explored it all! Amazing!"
            ],
            levelUp: [
                "New territory ahead!",
                "The path gets trickier!"
            ]
        },
        categoryHints: {
            maths: "Counting the treasure...",
            science: "Examining the specimen...",
            riddles: "Reading the ancient riddle...",
            spelling: "Deciphering the map...",
            india: "Exploring the subcontinent..."
        }
    },

    coder: {
        id: 'coder',
        name: 'Pixel',
        tagline: 'Code crafter!',
        color: '#FD79A8',
        colorLight: '#FFE0EB',
        personality: 'creative',
        svg: `<svg viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Hair -->
            <path d="M30 50 Q28 20 50 16 Q60 12 75 16 Q95 22 92 50" fill="#6C5CE7"/>
            <path d="M30 50 Q30 35 38 32" fill="#6C5CE7"/>
            <path d="M85 28 Q92 30 92 42" fill="#6C5CE7"/>
            <!-- Hair streak -->
            <path d="M44 16 Q48 22 42 30" stroke="#A29BFE" stroke-width="3" fill="none" stroke-linecap="round"/>
            <!-- Head -->
            <ellipse cx="60" cy="50" rx="28" ry="30" fill="#FFEAA7"/>
            <!-- Headphones band -->
            <path d="M28 44 Q28 24 60 22 Q92 24 92 44" fill="none" stroke="#636E72" stroke-width="4" stroke-linecap="round"/>
            <!-- Headphone left -->
            <rect x="20" y="38" width="14" height="18" rx="5" fill="#636E72"/>
            <rect x="22" y="40" width="10" height="14" rx="4" fill="#FD79A8"/>
            <!-- Headphone right -->
            <rect x="86" y="38" width="14" height="18" rx="5" fill="#636E72"/>
            <rect x="88" y="40" width="10" height="14" rx="4" fill="#FD79A8"/>
            <!-- Eyes -->
            <g class="char-eyes">
                <circle cx="48" cy="48" r="6" fill="white"/>
                <circle cx="72" cy="48" r="6" fill="white"/>
                <circle cx="50" cy="48" r="3" fill="#2D3436"/>
                <circle cx="74" cy="48" r="3" fill="#2D3436"/>
                <circle cx="51" cy="46.5" r="1.5" fill="white"/>
                <circle cx="75" cy="46.5" r="1.5" fill="white"/>
            </g>
            <!-- Mouth -->
            <g class="char-mouth">
                <path d="M52 62 Q60 68 68 62" stroke="#2D3436" stroke-width="2" fill="none" stroke-linecap="round"/>
            </g>
            <!-- Hoodie -->
            <path d="M28 82 L28 140 Q28 148 36 148 L84 148 Q92 148 92 140 L92 82 Q76 76 60 78 Q44 76 28 82Z" fill="#FD79A8"/>
            <!-- Hoodie pocket -->
            <rect x="38" y="112" width="44" height="20" rx="8" fill="#E84393"/>
            <!-- Hood drawstrings -->
            <line x1="50" y1="82" x2="48" y2="96" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            <line x1="70" y1="82" x2="72" y2="96" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
            <!-- Code symbols on hoodie -->
            <text x="60" y="106" text-anchor="middle" fill="white" font-size="14" font-weight="bold" font-family="monospace">&lt;/&gt;</text>
            <!-- Arms -->
            <rect x="10" y="90" width="18" height="10" rx="5" fill="#FD79A8"/>
            <rect x="92" y="90" width="18" height="10" rx="5" fill="#FD79A8"/>
            <!-- Hands -->
            <circle cx="10" cy="95" r="6" fill="#FFEAA7"/>
            <circle cx="110" cy="95" r="6" fill="#FFEAA7"/>
            <!-- Legs -->
            <rect x="36" y="148" width="16" height="6" rx="3" fill="#2D3436"/>
            <rect x="68" y="148" width="16" height="6" rx="3" fill="#2D3436"/>
            <!-- Sneakers -->
            <rect x="32" y="150" width="24" height="10" rx="5" fill="white"/>
            <rect x="64" y="150" width="24" height="10" rx="5" fill="white"/>
            <rect x="32" y="150" width="24" height="4" rx="2" fill="#FD79A8" opacity="0.3"/>
            <rect x="64" y="150" width="24" height="4" rx="2" fill="#FD79A8" opacity="0.3"/>
        </svg>`,
        expressions: {
            neutral: {
                eyes: `<circle cx="48" cy="48" r="6" fill="white"/><circle cx="72" cy="48" r="6" fill="white"/><circle cx="50" cy="48" r="3" fill="#2D3436"/><circle cx="74" cy="48" r="3" fill="#2D3436"/><circle cx="51" cy="46.5" r="1.5" fill="white"/><circle cx="75" cy="46.5" r="1.5" fill="white"/>`,
                mouth: `<path d="M52 62 Q60 68 68 62" stroke="#2D3436" stroke-width="2" fill="none" stroke-linecap="round"/>`
            },
            happy: {
                eyes: `<path d="M42 48 Q48 40 54 48" stroke="#2D3436" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M66 48 Q72 40 78 48" stroke="#2D3436" stroke-width="2.5" fill="none" stroke-linecap="round"/>`,
                mouth: `<path d="M48 60 Q60 74 72 60" stroke="#2D3436" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
            },
            thinking: {
                eyes: `<circle cx="48" cy="48" r="6" fill="white"/><circle cx="72" cy="48" r="6" fill="white"/><circle cx="52" cy="48" r="3" fill="#2D3436"/><circle cx="76" cy="48" r="3" fill="#2D3436"/><circle cx="53" cy="46.5" r="1.5" fill="white"/><circle cx="77" cy="46.5" r="1.5" fill="white"/>`,
                mouth: `<path d="M56 64 Q60 62 64 64" stroke="#2D3436" stroke-width="2" fill="none" stroke-linecap="round"/>`
            },
            sad: {
                eyes: `<circle cx="48" cy="50" r="5" fill="white"/><circle cx="72" cy="50" r="5" fill="white"/><circle cx="50" cy="50" r="2.5" fill="#2D3436"/><circle cx="74" cy="50" r="2.5" fill="#2D3436"/>`,
                mouth: `<path d="M52 66 Q60 60 68 66" stroke="#2D3436" stroke-width="2" fill="none" stroke-linecap="round"/>`
            },
            excited: {
                eyes: `<circle cx="48" cy="46" r="7" fill="white"/><circle cx="72" cy="46" r="7" fill="white"/><circle cx="50" cy="44" r="4" fill="#2D3436"/><circle cx="74" cy="44" r="4" fill="#2D3436"/><circle cx="52" cy="42" r="2" fill="white"/><circle cx="76" cy="42" r="2" fill="white"/><line x1="38" y1="36" x2="43" y2="40" stroke="#FD79A8" stroke-width="2" stroke-linecap="round"/><line x1="82" y1="36" x2="77" y2="40" stroke="#FD79A8" stroke-width="2" stroke-linecap="round"/>`,
                mouth: `<ellipse cx="60" cy="64" rx="10" ry="7" fill="#2D3436"/><ellipse cx="60" cy="62" rx="7" ry="3" fill="#FF6B9D"/>`
            }
        },
        messages: {
            greeting: [
                "Console.log('Let\\'s do this!');",
                "Ready to compile some answers!",
                "Loading quiz module... Done!"
            ],
            correct: [
                "No bugs here! Clean code!",
                "That answer passed all tests!",
                "Commit and push - it's perfect!",
                "Zero errors, zero warnings!"
            ],
            wrong: [
                "Syntax error! Let's debug it!",
                "That's a bug - we'll patch it!",
                "Time for code review!"
            ],
            retry: [
                "Running again in debug mode...",
                "Let's refactor that answer!"
            ],
            streak3: [
                "Your code is compiling perfectly!",
                "Stack overflow? More like stack AWESOME!"
            ],
            streak5: [
                "YOU'RE A 10x DEVELOPER!",
                "Achievement unlocked: CODE WIZARD!"
            ],
            encouragement: [
                "Every great coder makes mistakes!",
                "Keep iterating - you'll get there!"
            ],
            complete: [
                "Build successful! Ship it!",
                "All tests passed! Great session!"
            ],
            levelUp: [
                "Debugging level increased!",
                "Advanced mode activated!"
            ]
        },
        categoryHints: {
            maths: "Compiling numbers...",
            science: "Running the test suite...",
            riddles: "Parsing the logic...",
            spelling: "Spell-checking...",
            india: "Loading geo module..."
        }
    }
};

// Get a random message of a type for a character
function getCharacterMessage(characterId, type) {
    const char = CHARACTERS[characterId];
    if (!char || !char.messages[type]) return '';
    const msgs = char.messages[type];
    return msgs[Math.floor(Math.random() * msgs.length)];
}

// Get character SVG with a specific expression
function getCharacterSVG(characterId, expression = 'neutral') {
    const char = CHARACTERS[characterId];
    if (!char) return '';

    let svg = char.svg;
    const expr = char.expressions[expression] || char.expressions.neutral;

    // Replace eyes
    svg = svg.replace(
        /<g class="char-eyes">[\s\S]*?<\/g>/,
        `<g class="char-eyes">${expr.eyes}</g>`
    );

    // Replace mouth
    svg = svg.replace(
        /<g class="char-mouth">[\s\S]*?<\/g>/,
        `<g class="char-mouth">${expr.mouth}</g>`
    );

    return svg;
}
