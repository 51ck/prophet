/** T10.4 — pure card-meaning lookup, transcribed verbatim from spec/decks/*.md. No I/O. */

export type CardMeaning = {
  upright: string;
  reversed: string;
  imagery: string;
};

const LIGHT_SEERS_MEANINGS: Record<string, CardMeaning> = {
  fool: {
    upright: "fresh start, trust without the whole map",
    reversed: "reckless leap, naivete pretending as courage",
    imagery: "figure at a cliff-edge of beginning, light pack, open sky",
  },
  magician: {
    upright: "agency, focused will, tools in hand",
    reversed: "manipulation, scattered power, performance without substance",
    imagery: "person at a table of tools, one hand grounding one raised",
  },
  "high-priestess": {
    upright: "inner knowing, wait-and-listen wisdom",
    reversed: "secrets used as control, refusing what you already know",
    imagery: "veiled figure between pillars, moon water, held scroll",
  },
  empress: {
    upright: "nurture, creative abundance, embodied care",
    reversed: "smothering care, depletion, worth tied only to giving",
    imagery: "lush garden throne, ripeness, soft authority",
  },
  emperor: {
    upright: "structure, boundaries, steady leadership",
    reversed: "rigidity, control hunger, fear dressed as order",
    imagery: "throne, armor or crown of stability, mapped domain",
  },
  hierophant: {
    upright: "shared meaning, mentorship, living tradition",
    reversed: "dogma, borrowed belief without inner yes",
    imagery: "teacher figure, seekers, keys or shared rite",
  },
  lovers: {
    upright: "aligned choice, values meeting desire",
    reversed: "false unity, choice avoided, self-betrayal for peace",
    imagery: "two figures and a higher witness, forked path of heart",
  },
  chariot: {
    upright: "directed will, momentum with reins",
    reversed: "forcing progress, ego race, direction without stewardship",
    imagery: "chariot held between opposing forces, onward gaze",
  },
  strength: {
    upright: "gentle courage, soft power over fear",
    reversed: "brittle bravado, cruelty to the soft self",
    imagery: "person and lion in calm bond, infinity or flower of patience",
  },
  hermit: {
    upright: "deliberate solitude, inner lamp",
    reversed: "isolation as escape, withholding light",
    imagery: "lone figure on a height, lantern, simple staff",
  },
  wheel: {
    upright: "turn of pattern, luck as cycle not verdict",
    reversed: "resisting change, blaming fate for choice",
    imagery: "wheel with rising and falling figures, cyclic symbols",
  },
  justice: {
    upright: "honest accounting, fair balance",
    reversed: "self-justifying story, scales tipped by ego",
    imagery: "scales and upright blade, clear-eyed judge",
  },
  "hanged-one": {
    upright: "pause that reveals, willing surrender of angle",
    reversed: "stuck martyrdom, delay as refusal to see",
    imagery: "figure suspended, world flipped, quiet halo",
  },
  death: {
    upright: "necessary ending, compost of identity",
    reversed: "fear of change, clinging to dead form",
    imagery: "threshold figure, ending that clears ground",
  },
  temperance: {
    upright: "integration, paced blending",
    reversed: "extremes, impatience with process",
    imagery: "figure pouring between vessels, one foot in water",
  },
  devil: {
    upright: "named attachment, shadow bargain seen",
    reversed: "denial of bondage, glamor of the chain",
    imagery: "linked figures, torch of appetite, ungilded truth",
  },
  tower: {
    upright: "sudden truth-break, false structure falls",
    reversed: "chaos for its own drama, refusing the lesson of collapse",
    imagery: "tower struck, crown falling, lightning of revelation",
  },
  star: {
    upright: "renewed hope after storm, quiet faith",
    reversed: "wishful drift, hope without watering",
    imagery: "naked replenishing figure, stars, water poured",
  },
  moon: {
    upright: "dream logic, fear and intuition mixed",
    reversed: "projection fog, chasing illusion",
    imagery: "path between towers, moon, dog and wolf, water",
  },
  sun: {
    upright: "clarity, warmth, simple joy of being seen",
    reversed: "forced positivity, blind glare",
    imagery: "radiant child or open figure, sunflowers or clear light",
  },
  judgement: {
    upright: "wake-up call, answer to a deeper summons",
    reversed: "harsh self-trial, refusing the call",
    imagery: "figures rising, horn or call from above",
  },
  world: {
    upright: "completion, belonging in the whole",
    reversed: "almost-there stall, perfectionism delaying close",
    imagery: "dancing figure in a wreath, fourfold guardians",
  },
  "ace-of-wands": {
    upright: "spark of desire, permission to begin",
    reversed: "spark wasted, motivation blocked",
    imagery: "single wand alight, green shoot of yes",
  },
  "two-of-wands": {
    upright: "planning from a vantage, world in hand",
    reversed: "fear of leaving the map, planning as delay",
    imagery: "figure with globe or view, two wands of choice",
  },
  "three-of-wands": {
    upright: "ships out, expansion of what you started",
    reversed: "waiting without tending, restless stagnation",
    imagery: "figure watching horizon, three wands planted",
  },
  "four-of-wands": {
    upright: "celebration of stable joy, home-base rite",
    reversed: "premature party, foundation ignored",
    imagery: "garlanded threshold, joy of arrival",
  },
  "five-of-wands": {
    upright: "creative conflict, sparring for growth",
    reversed: "petty fight, ego scrum",
    imagery: "figures crossing wands, chaotic play-fight",
  },
  "six-of-wands": {
    upright: "recognition, earned visibility",
    reversed: "hollow applause, image over substance",
    imagery: "rider with wreath, crowd or banners",
  },
  "seven-of-wands": {
    upright: "holding your ground, brave boundary",
    reversed: "defensiveness, isolation of the hill",
    imagery: "figure above others, defending from height",
  },
  "eight-of-wands": {
    upright: "swift news, aligned acceleration",
    reversed: "scattershot haste, messages without land",
    imagery: "wands in flight, clear air speed",
  },
  "nine-of-wands": {
    upright: "wounded resilience, last stand of will",
    reversed: "paranoia, armor that never rests",
    imagery: "bandaged figure, row of wands behind",
  },
  "ten-of-wands": {
    upright: "overload, burden of too many yeses",
    reversed: "refusal to set down, martyr load",
    imagery: "figure bent under bundle of wands",
  },
  "page-of-wands": {
    upright: "curious messenger of passion",
    reversed: "scattered spark, impatience with craft",
    imagery: "young messenger with wand, eager step",
  },
  "knight-of-wands": {
    upright: "bold charge toward desire",
    reversed: "reckless burn, leave scorched",
    imagery: "knight mid-rush, flame of vocation",
  },
  "queen-of-wands": {
    upright: "charismatic warmth, confident attraction",
    reversed: "jealous fire, charm as control",
    imagery: "queen with wand, sunflower or cat of poise",
  },
  "king-of-wands": {
    upright: "visionary leadership of will",
    reversed: "tyrant of vision, charisma without care",
    imagery: "king wand-raised, gaze of creative rule",
  },
  "ace-of-cups": {
    upright: "heart opens, emotional refill",
    reversed: "numb offer, love refused or spilled",
    imagery: "cup overflowing, dove or light of feeling",
  },
  "two-of-cups": {
    upright: "mutual recognition, partnership spark",
    reversed: "imbalance dressed as bond, projection love",
    imagery: "two figures exchanging cups",
  },
  "three-of-cups": {
    upright: "friendship joy, shared celebration",
    reversed: "clique escape, party over truth",
    imagery: "three figures toasting, dance of belonging",
  },
  "four-of-cups": {
    upright: "apathy to the offered cup, need to re-taste",
    reversed: "sulking refusal, missed nourishment",
    imagery: "figure under tree, three cups ignored, one offered",
  },
  "five-of-cups": {
    upright: "grief for what spilled, learning to turn",
    reversed: "stuck in loss, refusing remaining cups",
    imagery: "cloak over spilled cups, two still standing",
  },
  "six-of-cups": {
    upright: "innocent exchange, healing nostalgia",
    reversed: "stuck in past sweetness, regression as safety",
    imagery: "children or past-gift exchange of cups",
  },
  "seven-of-cups": {
    upright: "many visions, choice among fantasies",
    reversed: "illusion buffet, choice paralysis",
    imagery: "figure before floating cups of wish",
  },
  "eight-of-cups": {
    upright: "leaving what no longer feeds, quiet walk away",
    reversed: "running from feeling, abandonment habit",
    imagery: "figure walking from stacked cups toward night",
  },
  "nine-of-cups": {
    upright: "content wish momentarily met",
    reversed: "smug satisfaction, wish without sharing",
    imagery: "figure before row of cups, small smile of enough",
  },
  "ten-of-cups": {
    upright: "emotional home, shared joy made durable",
    reversed: "picture-perfect performance, cracked ideal",
    imagery: "family or circle under rainbow of cups",
  },
  "page-of-cups": {
    upright: "tender message, creative feeling",
    reversed: "emotional immaturity, mood as messenger",
    imagery: "youth with cup, fish of surprise feeling",
  },
  "knight-of-cups": {
    upright: "romantic quest, ideal offered",
    reversed: "seduction without stay, mood chasing",
    imagery: "knight with cup, graceful approach",
  },
  "queen-of-cups": {
    upright: "empathic depth, held feeling",
    reversed: "drown in others’ tides, boundary melt",
    imagery: "queen with ornate cup, water mirror",
  },
  "king-of-cups": {
    upright: "emotional mastery, calm counsel",
    reversed: "manipulation by mood, cool detachment mask",
    imagery: "king cup-steady, water under throne",
  },
  "ace-of-swords": {
    upright: "breakthrough clarity, clean cut of truth",
    reversed: "cruel wit, clarity weaponized",
    imagery: "upright sword in crown of light",
  },
  "two-of-swords": {
    upright: "stalemate mind, blind balanced choice",
    reversed: "refusal to see, peace by numbness",
    imagery: "blindfolded figure, crossed swords",
  },
  "three-of-swords": {
    upright: "heartbreak that tells truth",
    reversed: "wallowing in the wound, story of betrayal only",
    imagery: "three swords through heart or storm",
  },
  "four-of-swords": {
    upright: "rest of mind, healing pause",
    reversed: "shut-down escape, refusal to re-enter",
    imagery: "figure at rest, swords above as watch",
  },
  "five-of-swords": {
    upright: "hollow win, conflict that costs",
    reversed: "gloating defeat of others, shame of the fight",
    imagery: "figure collecting swords, others leave",
  },
  "six-of-swords": {
    upright: "passage through, mind leaving storm",
    reversed: "running while dragging unfinished thought",
    imagery: "boat crossing with swords, quiet ferry",
  },
  "seven-of-swords": {
    upright: "strategy, stealth, partial take",
    reversed: "self-deception, theft of trust",
    imagery: "figure slipping away with swords",
  },
  "eight-of-swords": {
    upright: "bound by beliefs, mental cage",
    reversed: "learned helplessness, waiting for rescue",
    imagery: "bound figure among swords, still a path",
  },
  "nine-of-swords": {
    upright: "night anxiety, mind attacking itself",
    reversed: "rumination spiral, fear as identity",
    imagery: "figure upright in bed, swords of worry",
  },
  "ten-of-swords": {
    upright: "rock bottom of a story, ending of the blade",
    reversed: "identifying as the victim forever",
    imagery: "figure with ten swords, dawn still possible",
  },
  "page-of-swords": {
    upright: "curious mind, sharp questions",
    reversed: "gossip, restless critique",
    imagery: "youth with sword, wind-watching",
  },
  "knight-of-swords": {
    upright: "charge of idea, swift argument",
    reversed: "brutality of intellect, rush into fight",
    imagery: "knight sword-forward, storm of thought",
  },
  "queen-of-swords": {
    upright: "clear-eyed honesty, cut without cruelty",
    reversed: "cold blade, wit that isolates",
    imagery: "queen sword raised, clear sky",
  },
  "king-of-swords": {
    upright: "principled judgment, fair mental authority",
    reversed: "tyrant of reason, law without heart",
    imagery: "king with sword, throne of thought",
  },
  "ace-of-pentacles": {
    upright: "seed of material chance, grounded yes",
    reversed: "opportunity fumbled, greed for seed",
    imagery: "hand offering coin or disk of earth",
  },
  "two-of-pentacles": {
    upright: "juggle of priorities, flexible balance",
    reversed: "drop the balls, chaos of yeses",
    imagery: "figure dancing with two disks",
  },
  "three-of-pentacles": {
    upright: "craft in collaboration, skilled work seen",
    reversed: "solo ego vs craft, shoddy teamwork",
    imagery: "artisans at a work, shared plan",
  },
  "four-of-pentacles": {
    upright: "holding resource tight, stability grip",
    reversed: "miser mind, fear of loss as fortress",
    imagery: "figure clutching coin, city behind",
  },
  "five-of-pentacles": {
    upright: "hardship at the door, need for help",
    reversed: "pride that refuses aid, exile of worth",
    imagery: "figures in cold outside lit window",
  },
  "six-of-pentacles": {
    upright: "fair exchange, give and receive",
    reversed: "strings attached, charity as power",
    imagery: "scales and coins between figures",
  },
  "seven-of-pentacles": {
    upright: "patient assessment of growth",
    reversed: "impatience with harvest time, despair at wait",
    imagery: "figure watching plants of disks",
  },
  "eight-of-pentacles": {
    upright: "devotion to craft, repetition that skills",
    reversed: "busywork without mastery, grind as identity",
    imagery: "artisan carving disks, focused bench",
  },
  "nine-of-pentacles": {
    upright: "self-sufficient abundance, earned grace",
    reversed: "lonely luxury, worth only as display",
    imagery: "figure in garden of wealth, bird of leisure",
  },
  "ten-of-pentacles": {
    upright: "lineage wealth, lasting belonging of house",
    reversed: "inheritance drama, hollow tradition",
    imagery: "family estate, arches of lasting disks",
  },
  "page-of-pentacles": {
    upright: "student of the real, practical study",
    reversed: "stalled start, daydream of craft",
    imagery: "youth with disk, study of earth",
  },
  "knight-of-pentacles": {
    upright: "steady progress, reliable method",
    reversed: "stubborn crawl, refusal of pace change",
    imagery: "knight with disk, slow careful horse",
  },
  "queen-of-pentacles": {
    upright: "nurturing abundance, practical care",
    reversed: "smother security, value only as provider",
    imagery: "queen with disk, fertile garden",
  },
  "king-of-pentacles": {
    upright: "stewardship of wealth, mature provision",
    reversed: "greed throne, status as self",
    imagery: "king with disk, abundant domain",
  },
};

const RIDER_WAITE_MEANINGS: Record<string, CardMeaning> = {
  fool: {
    upright: "new beginning, leap of faith, unwritten path",
    reversed: "recklessness, missed step, fear of starting",
    imagery: "young traveler at a cliff edge, small dog at heel, sun overhead, bundle on a stick",
  },
  magician: {
    upright: "willpower, resourcefulness, action from ability",
    reversed: "manipulation, untapped potential, poor planning",
    imagery: "figure with one arm raised to sky, one pointing to earth, all four suit symbols on the table",
  },
  "high-priestess": {
    upright: "intuition, hidden knowledge, the unconscious",
    reversed: "secrets withheld, disconnection from inner voice",
    imagery: "seated woman between black and white pillars, veil of pomegranates, scroll marked TORA",
  },
  empress: {
    upright: "abundance, nurturing, fertility of idea or body",
    reversed: "neglect, creative block, overbearing care",
    imagery: "crowned woman on a cushioned throne in a wheat field, Venus symbol, flowing gown",
  },
  emperor: {
    upright: "authority, structure, fatherly control",
    reversed: "domination, rigidity, loss of authority",
    imagery: "armored king on a stone throne of rams’ heads, orb and scepter, barren mountains behind",
  },
  hierophant: {
    upright: "tradition, institution, spiritual guidance",
    reversed: "rebellion against convention, empty ritual",
    imagery: "robed figure between two pillars, triple crown, two acolytes kneeling below",
  },
  lovers: {
    upright: "union, choice of the heart, alignment of values",
    reversed: "disharmony, misaligned values, a choice avoided",
    imagery: "man and woman beneath an angel, sun above, tree of flames and tree of fruit",
  },
  chariot: {
    upright: "willpower, victory through control, forward drive",
    reversed: "lack of direction, aggression, loss of control",
    imagery: "armored figure in a chariot pulled by two sphinxes, one black one white, starred canopy",
  },
  strength: {
    upright: "courage, patience, inner strength over force",
    reversed: "self-doubt, weakness, raw force without control",
    imagery: "woman calmly closing a lion’s jaw, infinity symbol above her head, garland of flowers",
  },
  hermit: {
    upright: "introspection, solitude, guidance from within",
    reversed: "isolation, withdrawal, refusing counsel",
    imagery: "cloaked elder on a mountain peak, raised lantern with a six-pointed star, staff in hand",
  },
  wheel: {
    upright: "cycles, fate, a turn for the better",
    reversed: "bad luck, resistance to change, a turn for the worse",
    imagery: "great wheel in the clouds with sphinx, serpent, and jackal-figure, four winged creatures at the corners",
  },
  justice: {
    upright: "fairness, truth, cause and effect",
    reversed: "dishonesty, unfair outcome, avoiding accountability",
    imagery: "crowned figure enthroned between pillars, upright sword in one hand, scales in the other",
  },
  "hanged-one": {
    upright: "surrender, new perspective, letting go",
    reversed: "stalling, needless sacrifice, resistance to release",
    imagery: "figure hanging by one foot from a living tree, calm face, halo of light around the head",
  },
  death: {
    upright: "transformation, ending, inevitable change",
    reversed: "resistance to change, decay, fear of the end",
    imagery: "skeletal rider in black armor on a pale horse, fallen king, rising sun between towers",
  },
  temperance: {
    upright: "balance, moderation, patient blending",
    reversed: "excess, imbalance, discord",
    imagery: "winged angel pouring water between two cups, one foot on land, one in the stream",
  },
  devil: {
    upright: "bondage, temptation, materialism",
    reversed: "breaking free, reclaiming power, releasing the chain",
    imagery: "horned figure above two chained figures, loose collars, torch turned downward",
  },
  tower: {
    upright: "sudden upheaval, revelation, collapse of false structure",
    reversed: "disaster delayed, resisted change, fear of the fall",
    imagery: "lightning-struck tower, crown thrown from the top, two figures falling from the windows",
  },
  star: {
    upright: "hope, inspiration, renewal after hardship",
    reversed: "despair, lost faith, disconnection from hope",
    imagery: "kneeling figure pouring water onto land and into a pool, seven small stars and one large above",
  },
  moon: {
    upright: "illusion, intuition, subconscious fear",
    reversed: "confusion clearing, releasing fear, hidden truth surfacing",
    imagery: "moon with a face over two towers, dog and wolf howling, crayfish emerging from a pool, a path between",
  },
  sun: {
    upright: "joy, success, vitality",
    reversed: "temporary sadness, delayed success, clouded joy",
    imagery: "radiant sun over a child on a white horse, sunflowers along a wall, banner raised",
  },
  judgement: {
    upright: "reckoning, awakening, a call answered",
    reversed: "self-doubt, refusal of the call, harsh self-judgment",
    imagery: "angel with trumpet over rising figures with arms open, coffins in calm water, snow-capped peaks",
  },
  world: {
    upright: "completion, fulfillment, wholeness",
    reversed: "incompletion, delay, unfinished business",
    imagery: "dancing figure wrapped in a wreath holding two wands, four fixed-sign creatures at the corners",
  },
  "ace-of-wands": {
    upright: "inspiration, new venture, creative spark",
    reversed: "delay, lack of motivation, false start",
    imagery: "hand from a cloud holding a budding wand over a distant landscape",
  },
  "two-of-wands": {
    upright: "planning, foresight, a world within reach",
    reversed: "fear of the unknown, lack of planning, playing small",
    imagery: "figure on a battlement holding a globe, one wand in hand, one fixed to the wall",
  },
  "three-of-wands": {
    upright: "expansion, foresight, awaiting return",
    reversed: "delays abroad, lack of foresight, obstacles to expansion",
    imagery: "figure on a cliff watching ships at sea, three wands planted behind",
  },
  "four-of-wands": {
    upright: "celebration, homecoming, harmony",
    reversed: "lack of harmony, delayed celebration, transition",
    imagery: "garlanded wands framing a gate, figures dancing before a distant castle",
  },
  "five-of-wands": {
    upright: "conflict, competition, disorganized struggle",
    reversed: "avoided conflict, resolution, tension released",
    imagery: "five figures sparring with raised wands, no clear order",
  },
  "six-of-wands": {
    upright: "victory, recognition, public success",
    reversed: "private achievement, ego, fall from favor",
    imagery: "rider on a white horse with a laurel-crowned wand, crowd walking alongside",
  },
  "seven-of-wands": {
    upright: "defense, standing your ground, perseverance",
    reversed: "overwhelmed, giving up ground, exhaustion",
    imagery: "figure on high ground fending off six wands from below",
  },
  "eight-of-wands": {
    upright: "swift movement, alignment, fast-approaching news",
    reversed: "delays, frustration, scattered energy",
    imagery: "eight wands flying level through open sky over a river and countryside",
  },
  "nine-of-wands": {
    upright: "resilience, last stand, guarded persistence",
    reversed: "exhaustion, paranoia, defensiveness without cause",
    imagery: "bandaged figure gripping a wand, warily eyeing a row of eight others",
  },
  "ten-of-wands": {
    upright: "burden, responsibility, overextension",
    reversed: "setting the load down, delegating, releasing burden",
    imagery: "figure bent and straining under ten carried wands, town visible ahead",
  },
  "page-of-wands": {
    upright: "enthusiasm, exploration, a message of new ideas",
    reversed: "delayed news, lack of direction, immaturity",
    imagery: "young figure in desert dress admiring a budding wand, plumed cap",
  },
  "knight-of-wands": {
    upright: "energy, passion, impulsive action",
    reversed: "haste, recklessness, scattered drive",
    imagery: "knight in fire-colored armor charging forward on a rearing horse",
  },
  "queen-of-wands": {
    upright: "confidence, warmth, independent determination",
    reversed: "jealousy, demanding, insecurity behind bravado",
    imagery: "queen enthroned facing forward, sunflower and black cat, wand upright in hand",
  },
  "king-of-wands": {
    upright: "leadership, vision, bold entrepreneurship",
    reversed: "impulsiveness, high expectations, ruthless ambition",
    imagery: "king on a throne carved with salamanders, wand in hand, gaze toward the horizon",
  },
  "ace-of-cups": {
    upright: "new feeling, emotional fullness, love offered",
    reversed: "emotional loss, blocked feeling, love withheld",
    imagery: "hand from a cloud holding an overflowing cup, dove descending, five streams of water",
  },
  "two-of-cups": {
    upright: "partnership, mutual attraction, union",
    reversed: "imbalance, broken connection, tension in a bond",
    imagery: "two figures exchanging cups, caduceus and lion’s head above",
  },
  "three-of-cups": {
    upright: "celebration, friendship, community joy",
    reversed: "overindulgence, gossip, isolation from a group",
    imagery: "three figures raising cups together amid a harvest of fruit",
  },
  "four-of-cups": {
    upright: "contemplation, apathy, missed opportunity",
    reversed: "renewed interest, awakening, new motivation",
    imagery: "seated figure under a tree, arms crossed, ignoring an offered cup from a cloud",
  },
  "five-of-cups": {
    upright: "loss, regret, focus on what spilled",
    reversed: "acceptance, moving forward, finding peace with loss",
    imagery: "cloaked figure facing three spilled cups, two upright cups behind unnoticed",
  },
  "six-of-cups": {
    upright: "nostalgia, childhood memory, innocent giving",
    reversed: "stuck in the past, naivety, unrealistic longing",
    imagery: "child figures exchanging flower-filled cups in a quiet courtyard",
  },
  "seven-of-cups": {
    upright: "choices, fantasy, wishful thinking",
    reversed: "clarity, decisive choice, cutting through illusion",
    imagery: "silhouetted figure before floating cups holding a wreath, jewels, a dragon, a veiled figure, a snake, a castle, a laurel",
  },
  "eight-of-cups": {
    upright: "walking away, seeking something deeper, disillusionment",
    reversed: "fear of moving on, stagnation, avoiding the truth",
    imagery: "cloaked figure walking away under an eclipsed moon, eight stacked cups left behind",
  },
  "nine-of-cups": {
    upright: "satisfaction, contentment, wish fulfilled",
    reversed: "smugness, overindulgence, unfulfilled despite appearance",
    imagery: "seated figure with arms crossed before a curved row of nine cups",
  },
  "ten-of-cups": {
    upright: "harmony, emotional fulfillment, family joy",
    reversed: "broken harmony, unmet expectations, strained relationships",
    imagery: "family with arms raised beneath a rainbow of ten cups, home in the distance",
  },
  "page-of-cups": {
    upright: "creative message, curiosity, emotional openness",
    reversed: "emotional immaturity, unrealistic ideas, blocked creativity",
    imagery: "young figure holding a cup with a fish peeking out, standing at the shore",
  },
  "knight-of-cups": {
    upright: "romance, charm, an offer made with feeling",
    reversed: "moodiness, unrealistic idealism, disappointment",
    imagery: "knight in winged helm riding slowly, cup held forward like an offering",
  },
  "queen-of-cups": {
    upright: "compassion, emotional security, intuitive care",
    reversed: "insecurity, moodiness, over-giving to others",
    imagery: "queen on a throne at water’s edge, gazing into an ornate closed cup",
  },
  "king-of-cups": {
    upright: "emotional balance, diplomacy, calm authority",
    reversed: "moodiness beneath control, manipulation, emotional coldness",
    imagery: "king on a throne afloat in turbulent water, calm despite the waves, cup and scepter in hand",
  },
  "ace-of-swords": {
    upright: "clarity, breakthrough, truth cutting through",
    reversed: "confusion, chaos, miscommunication",
    imagery: "hand from a cloud gripping an upright sword through a crown, mountain peaks below",
  },
  "two-of-swords": {
    upright: "stalemate, difficult choice, blocked emotion",
    reversed: "indecision, information overload, forced choice",
    imagery: "blindfolded figure seated at water’s edge, arms crossed with two swords, crescent moon above",
  },
  "three-of-swords": {
    upright: "heartbreak, sorrow, painful truth",
    reversed: "recovery, releasing pain, forgiveness",
    imagery: "three swords piercing a red heart against a rain-streaked grey sky",
  },
  "four-of-swords": {
    upright: "rest, recovery, contemplation",
    reversed: "restlessness, burnout, forced return to activity",
    imagery: "knight lying in effigy on a tomb, hands in prayer, three swords above, one below",
  },
  "five-of-swords": {
    upright: "conflict, win at a cost, betrayal",
    reversed: "reconciliation, resentment, walking away from a fight",
    imagery: "figure gathering swords with a smug look, two others walking away defeated",
  },
  "six-of-swords": {
    upright: "transition, moving on, leaving trouble behind",
    reversed: "resistance to change, unresolved baggage, stuck in transition",
    imagery: "ferryman poling a boat with a cloaked figure and child, six swords upright in the boat, calm water ahead",
  },
  "seven-of-swords": {
    upright: "deception, strategy, acting alone",
    reversed: "getting caught, conscience, coming clean",
    imagery: "figure sneaking away from a camp carrying five swords, two left behind",
  },
  "eight-of-swords": {
    upright: "restriction, self-imposed limitation, feeling trapped",
    reversed: "release, new perspective, taking back control",
    imagery: "bound and blindfolded figure surrounded by upright swords, castle visible in the distance",
  },
  "nine-of-swords": {
    upright: "anxiety, nightmare, worry that keeps you up",
    reversed: "releasing fear, seeking help, hope after despair",
    imagery: "figure sitting up in bed, head in hands, nine swords mounted on the wall above",
  },
  "ten-of-swords": {
    upright: "rock bottom, painful ending, betrayal complete",
    reversed: "recovery beginning, resisting an inevitable end, survival",
    imagery: "figure face-down with ten swords in the back, dark sky giving way to dawn on the horizon",
  },
  "page-of-swords": {
    upright: "curiosity, vigilance, new ideas",
    reversed: "gossip, all talk, scattered thinking",
    imagery: "young figure on a hilltop gripping a sword, alert stance, windswept clouds",
  },
  "knight-of-swords": {
    upright: "ambition, action, fast and driven",
    reversed: "recklessness, impulsiveness, unfocused aggression",
    imagery: "knight charging at full gallop, sword forward, storm clouds and birds scattering",
  },
  "queen-of-swords": {
    upright: "independent thought, clear boundaries, honest perception",
    reversed: "coldness, bitterness, cutting words",
    imagery: "queen enthroned in clear sky, sword upright, one hand raised as if beckoning truth",
  },
  "king-of-swords": {
    upright: "authority, clear judgment, intellectual power",
    reversed: "abuse of power, cruelty, rigid thinking",
    imagery: "king enthroned facing forward, sword upright, butterflies (transformation) carved on the throne",
  },
  "ace-of-pentacles": {
    upright: "new opportunity, prosperity, material beginning",
    reversed: "missed opportunity, poor planning, delayed gain",
    imagery: "hand from a cloud holding a single pentacle over a flowering garden path",
  },
  "two-of-pentacles": {
    upright: "balance, adaptability, juggling priorities",
    reversed: "overwhelm, disorganization, dropped priorities",
    imagery: "figure dancing while juggling two pentacles linked by an infinity ribbon, ships tossed at sea behind",
  },
  "three-of-pentacles": {
    upright: "teamwork, skill, collaborative craft",
    reversed: "lack of teamwork, misalignment, mediocrity",
    imagery: "craftsman at work in a cathedral archway, two onlookers reviewing the plan",
  },
  "four-of-pentacles": {
    upright: "security, control, holding on tightly",
    reversed: "greed, letting go, material insecurity",
    imagery: "figure clutching one pentacle to the chest, one underfoot, two balanced on the head, city behind",
  },
  "five-of-pentacles": {
    upright: "hardship, financial loss, feeling left out in the cold",
    reversed: "recovery, finding help, spiritual poverty ending",
    imagery: "two ragged figures trudging through snow past a lit stained-glass window",
  },
  "six-of-pentacles": {
    upright: "generosity, giving and receiving, charity",
    reversed: "debt, one-sided giving, strings attached",
    imagery: "standing figure with scales handing coins to two kneeling figures",
  },
  "seven-of-pentacles": {
    upright: "patience, assessment, long-term investment",
    reversed: "impatience, lack of reward, wasted effort",
    imagery: "figure leaning on a hoe, studying a vine heavy with pentacles",
  },
  "eight-of-pentacles": {
    upright: "mastery, diligence, dedication to craft",
    reversed: "perfectionism, lack of ambition, mindless repetition",
    imagery: "craftsman at a bench carving pentacles one after another, focused and unhurried",
  },
  "nine-of-pentacles": {
    upright: "abundance, self-sufficiency, luxury earned alone",
    reversed: "overwork, superficial success, isolation",
    imagery: "elegant figure in a flourishing vineyard, bird on a gloved hand, pentacles among the vines",
  },
  "ten-of-pentacles": {
    upright: "legacy, generational wealth, lasting family foundation",
    reversed: "family dispute, financial loss, broken tradition",
    imagery: "elder, couple, and child before a grand archway, dogs at their feet, ten pentacles arranged above",
  },
  "page-of-pentacles": {
    upright: "manifestation, new opportunity, careful study",
    reversed: "lack of progress, procrastination, unrealistic plans",
    imagery: "young figure in a green field studying a pentacle held up before them",
  },
  "knight-of-pentacles": {
    upright: "hard work, responsibility, steady routine",
    reversed: "stagnation, boredom, stubborn resistance to change",
    imagery: "knight seated still on a heavy black horse, holding a pentacle, plowed field behind",
  },
  "queen-of-pentacles": {
    upright: "nurturing, practical abundance, down-to-earth care",
    reversed: "self-neglect, smothering, insecurity about resources",
    imagery: "queen enthroned in a garden, pentacle in lap, rabbit at her feet, lush growth around",
  },
  "king-of-pentacles": {
    upright: "wealth, stability, generous provision",
    reversed: "greed, stubbornness, overattachment to material success",
    imagery: "king enthroned amid grapevines and a castle, pentacle in hand, bull carved on the throne",
  },
};

const MEANINGS_BY_DECK: Record<string, Record<string, CardMeaning>> = {
  "light-seers": LIGHT_SEERS_MEANINGS,
  "rider-waite": RIDER_WAITE_MEANINGS,
};

export function getCardMeaning(deckId: string, cardId: string): CardMeaning | undefined {
  const deck = MEANINGS_BY_DECK[deckId];
  if (!deck) return undefined;
  return deck[cardId];
}
