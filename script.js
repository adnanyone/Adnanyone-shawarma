// ------------------------
// Core state
// ------------------------

let shawarmas = 0;
let totalShawarmas = 0;
let flavorPoints = 0;

// Worlds: 1 = Shawarma Street, 2 = Kebab Kingdom
let currentWorld = 1;

// Base production
let baseClickPower = 1;
let baseAutoPower = 0;

// Multipliers
let clickMultiplier = 1;     // upgrades & prestige
let autoMultiplier = 1;
let globalMultiplier = 1;    // boosts, events

// Boosts
let goldenWrapActive = false;

// Prestige multipliers
let prestigeClickBonus = 0;   // in %
let prestigeAutoBonus = 0;
let prestigeGlobalBonus = 0;

// Ingredients
let ingredients = {
    garlic: 0,
    pickles: 0,
    tahini: 0,
    chili: 0,
    pita: 0,
    lemon: 0
};

// Achievements / secrets
let achievements = {
    first: false,
    hundred: false,
    thousand: false,
    tenThousand: false,
    clickMaster: false,
    autoEmpire: false,
    ingredientCollector: false,
    secretFinder: false,
    prestigeUnlocked: false
};

let secrets = {
    secretRecipe: false,
    forbiddenScroll: false,
    sauceDimension: false
};

// Click tracking for secrets
let totalClicks = 0;

// Costs
let costs = {
    extraSauce: 20,
    doubleGarlic: 150,
    premiumPita: 800,
    streetWorker: 50,
    deliveryScooter: 400,
    nightShift: 2000,
    goldenWrap: 1500,
    spiceMastery: 2500,
    secretRecipe: 5000, // used when we decide to let you buy something secret
    quantumShawarma: 5,
    infiniteSauce: 8,
    timeChef: 8
};

// Auto tick interval
let autoIntervalMs = 1000;
let autoIntervalId = null;

// ------------------------
// DOM references
// ------------------------

const shawarmaCountEl = document.getElementById("shawarmaCount");
const flavorPointsEl = document.getElementById("flavorPoints");
const worldNameEl = document.getElementById("worldName");
const mainShawarmaEl = document.getElementById("mainShawarma");
const perClickTextEl = document.getElementById("perClickText");

const eventLogEl = document.getElementById("eventLog");
const achievementListEl = document.getElementById("achievementList");

const switchWorldBtn = document.getElementById("switchWorldBtn");
const prestigeBtn = document.getElementById("prestigeBtn");

const goldenShawarmaBtn = document.getElementById("goldenShawarmaBtn");

// Cost elements
const extraSauceCostEl = document.getElementById("extraSauceCost");
const doubleGarlicCostEl = document.getElementById("doubleGarlicCost");
const premiumPitaCostEl = document.getElementById("premiumPitaCost");

const streetWorkerCostEl = document.getElementById("streetWorkerCost");
const deliveryScooterCostEl = document.getElementById("deliveryScooterCost");
const nightShiftCostEl = document.getElementById("nightShiftCost");

const goldenWrapCostEl = document.getElementById("goldenWrapCost");
const spiceMasteryCostEl = document.getElementById("spiceMasteryCost");

// Ingredient elements
const garlicCountEl = document.getElementById("garlicCount");
const picklesCountEl = document.getElementById("picklesCount");
const tahiniCountEl = document.getElementById("tahiniCount");
const chiliCountEl = document.getElementById("chiliCount");
const pitaCountEl = document.getElementById("pitaCount");
const lemonCountEl = document.getElementById("lemonCount");

// Secret entries
const secretRecipeEntryEl = document.getElementById("secretRecipeEntry");
const forbiddenScrollEntryEl = document.getElementById("forbiddenScrollEntry");
const sauceDimensionEntryEl = document.getElementById("sauceDimensionEntry");

// Prestige upgrade costs
const quantumCostEl = document.getElementById("quantumCost");
const infiniteSauceCostEl = document.getElementById("infiniteSauceCost");
const timeChefCostEl = document.getElementById("timeChefCost");

// ------------------------
// Utility
// ------------------------

function formatNumber(n) {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
    if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
    return Math.floor(n).toString();
}

function logEvent(text) {
    const div = document.createElement("div");
    div.textContent = text;
    div.classList.add("event-log-entry");
    eventLogEl.prepend(div);
}

// ------------------------
// Update UI
// ------------------------

function updateUI() {
    shawarmaCountEl.textContent = formatNumber(shawarmas);
    flavorPointsEl.textContent = formatNumber(flavorPoints);

    extraSauceCostEl.textContent = formatNumber(costs.extraSauce);
    doubleGarlicCostEl.textContent = formatNumber(costs.doubleGarlic);
    premiumPitaCostEl.textContent = formatNumber(costs.premiumPita);

    streetWorkerCostEl.textContent = formatNumber(costs.streetWorker);
    deliveryScooterCostEl.textContent = formatNumber(costs.deliveryScooter);
    nightShiftCostEl.textContent = formatNumber(costs.nightShift);

    goldenWrapCostEl.textContent = formatNumber(costs.goldenWrap);
    spiceMasteryCostEl.textContent = formatNumber(costs.spiceMastery);

    garlicCountEl.textContent = ingredients.garlic;
    picklesCountEl.textContent = ingredients.pickles;
    tahiniCountEl.textContent = ingredients.tahini;
    chiliCountEl.textContent = ingredients.chili;
    pitaCountEl.textContent = ingredients.pita;
    lemonCountEl.textContent = ingredients.lemon;

    const clickPowerDisplay = getClickGain();
    perClickTextEl.textContent = "+" + formatNumber(clickPowerDisplay) + " per click";

    // Switch world unlock
    switchWorldBtn.disabled = shawarmas < 5000 && currentWorld === 1;

    // Prestige unlock
    prestigeBtn.disabled = shawarmas < 100000;

    // Prestige upgrade cost text
    quantumCostEl.textContent = costs.quantumShawarma;
    infiniteSauceCostEl.textContent = costs.infiniteSauce;
    timeChefCostEl.textContent = costs.timeChef;

    updateAchievementsUI();
    updateSecretsUI();
}

function updateAchievementsUI() {
    achievementListEl.innerHTML = "";

    function addAchieved(name, condition) {
        const li = document.createElement("li");
        li.textContent = name;
        if (condition) li.classList.add("achievement-earned");
        achievementListEl.appendChild(li);
    }

    addAchieved("First Shawarma", achievements.first);
    addAchieved("100 Shawarmas", achievements.hundred);
    addAchieved("1,000 Shawarmas", achievements.thousand);
    addAchieved("10,000 Shawarmas", achievements.tenThousand);
    addAchieved("Click Master", achievements.clickMaster);
    addAchieved("Auto Empire", achievements.autoEmpire);
    addAchieved("Ingredient Collector", achievements.ingredientCollector);
    addAchieved("Secret Finder", achievements.secretFinder);
    addAchieved("Prestige Unlocked", achievements.prestigeUnlocked);
}

function updateSecretsUI() {
    function setSecret(el, unlocked, label) {
        if (unlocked) {
            el.textContent = label;
            el.classList.remove("secret-locked");
            el.classList.add("secret-unlocked");
        }
    }

    setSecret(secretRecipeEntryEl, secrets.secretRecipe, "Secret Recipe — Massive production boost");
    setSecret(forbiddenScrollEntryEl, secrets.forbiddenScroll, "Forbidden Scroll — Unlocks Sauce Dimension");
    setSecret(sauceDimensionEntryEl, secrets.sauceDimension, "The Sauce Dimension — A hidden world");
}

// ------------------------
// Core math
// ------------------------

function getClickGain() {
    let click = baseClickPower;
    click *= (1 + prestigeClickBonus / 100);
    click *= clickMultiplier;
    click *= (1 + prestigeGlobalBonus / 100);
    click *= globalMultiplier;
    return click;
}

function getAutoGainPerSecond() {
    let auto = baseAutoPower;
    auto *= (1 + prestigeAutoBonus / 100);
    auto *= autoMultiplier;
    auto *= (1 + prestigeGlobalBonus / 100);
    auto *= globalMultiplier;
    return auto;
}

// ------------------------
// Clicking logic
// ------------------------

mainShawarmaEl.addEventListener("click", () => {
    const gain = getClickGain();
    shawarmas += gain;
    totalShawarmas += gain;
    totalClicks++;

    maybeDropIngredient();
    handleClickSecrets();
    checkAchievements();

    updateUI();
});

// ------------------------
// Ingredients & secrets
// ------------------------

function maybeDropIngredient() {
    const r = Math.random();
    if (r > 0.03) return; // 3% chance

    const keys = Object.keys(ingredients);
    const drop = keys[Math.floor(Math.random() * keys.length)];
    ingredients[drop]++;

    logEvent(`You found some ${drop}.`);

    checkIngredientsSet();
}

function checkIngredientsSet() {
    const allHaveAtLeastOne = Object.values(ingredients).every(v => v > 0);
    if (allHaveAtLeastOne && !secrets.secretRecipe) {
        secrets.secretRecipe = true;
        achievements.secretFinder = true;
        logEvent("You assembled a full ingredient set. Secret Recipe discovered!");
    }

    const allHave5 = Object.values(ingredients).every(v => v >= 5);
    if (allHave5 && !secrets.forbiddenScroll) {
        secrets.forbiddenScroll = true;
        logEvent("A mysterious Forbidden Scroll appears in your kitchen...");
    }
}

function handleClickSecrets() {
    // Secret recipe after 200 clicks
    if (totalClicks === 200 && !secrets.secretRecipe) {
        secrets.secretRecipe = true;
        logEvent("After 200 perfect cuts, you discover a Secret Recipe.");
    }

    // Title click secret for Sauce Dimension
    // handled separately in title click listener
}

// Title secret: click title 10 times
let titleClicks = 0;
document.getElementById("gameTitle").addEventListener("click", () => {
    titleClicks++;
    if (titleClicks >= 10 && !secrets.sauceDimension) {
        secrets.sauceDimension = true;
        logEvent("You unlocked the legend of The Sauce Dimension.");
        achievements.secretFinder = true;
        updateUI();
    }
});

// ------------------------
// Upgrades
// ------------------------

function canAfford(cost) {
    return shawarmas >= cost;
}

function spend(cost) {
    shawarmas -= cost;
}

// Extra Sauce
document.getElementById("upgradeExtraSauce").addEventListener("click", () => {
    if (!canAfford(costs.extraSauce)) return;
    spend(costs.extraSauce);
    baseClickPower += 1;
    costs.extraSauce = Math.floor(costs.extraSauce * 1.5);
    updateUI();
});

// Double Garlic
document.getElementById("upgradeDoubleGarlic").addEventListener("click", () => {
    if (!canAfford(costs.doubleGarlic)) return;
    spend(costs.doubleGarlic);
    baseClickPower += 3;
    costs.doubleGarlic = Math.floor(costs.doubleGarlic * 1.7);
    updateUI();
});

// Premium Pita
document.getElementById("upgradePremiumPita").addEventListener("click", () => {
    if (!canAfford(costs.premiumPita)) return;
    spend(costs.premiumPita);
    baseClickPower += 10;
    costs.premiumPita = Math.floor(costs.premiumPita * 1.9);
    updateUI();
});

// Street Worker
document.getElementById("upgradeStreetWorker").addEventListener("click", () => {
    if (!canAfford(costs.streetWorker)) return;
    spend(costs.streetWorker);
    baseAutoPower += 1;
    costs.streetWorker = Math.floor(costs.streetWorker * 1.6);
    updateUI();
});

// Delivery Scooter
document.getElementById("upgradeDeliveryScooter").addEventListener("click", () => {
    if (!canAfford(costs.deliveryScooter)) return;
    spend(costs.deliveryScooter);
    baseAutoPower += 5;
    costs.deliveryScooter = Math.floor(costs.deliveryScooter * 1.7);
    updateUI();
});

// Night Shift Crew
document.getElementById("upgradeNightShift").addEventListener("click", () => {
    if (!canAfford(costs.nightShift)) return;
    spend(costs.nightShift);
    baseAutoPower += 20;
    costs.nightShift = Math.floor(costs.nightShift * 1.8);
    updateUI();
});

// Golden Wrap
document.getElementById("upgradeGoldenWrap").addEventListener("click", () => {
    if (!canAfford(costs.goldenWrap) || goldenWrapActive) return;
    spend(costs.goldenWrap);
    costs.goldenWrap = Math.floor(costs.goldenWrap * 2);

    goldenWrapActive = true;
    const prevGlobal = globalMultiplier;
    globalMultiplier *= 2;
    logEvent("Golden Wrap activated: 2× shawarmas for 20 seconds!");

    setTimeout(() => {
        goldenWrapActive = false;
        globalMultiplier = prevGlobal;
        logEvent("Golden Wrap effect has ended.");
        updateUI();
    }, 20000);

    updateUI();
});

// Spice Mastery
document.getElementById("upgradeSpiceMastery").addEventListener("click", () => {
    if (!canAfford(costs.spiceMastery)) return;
    spend(costs.spiceMastery);
    costs.spiceMastery = Math.floor(costs.spiceMastery * 2);
    globalMultiplier *= 1.10;
    logEvent("Spice Mastery acquired: permanent +10% shawarmas.");
    updateUI();
});

// ------------------------
// Auto production
// ------------------------

function startAutoLoop() {
    if (autoIntervalId) clearInterval(autoIntervalId);
    autoIntervalId = setInterval(() => {
        const gain = getAutoGainPerSecond();
        if (gain > 0) {
            shawarmas += gain;
            totalShawarmas += gain;
            maybeDropIngredient();
            checkAchievements();
            updateUI();
        }
    }, autoIntervalMs);
}

startAutoLoop();

// ------------------------
// Random events
// ------------------------

function scheduleRandomEvent() {
    const delay = 60_000 + Math.random() * 120_000; // between 1 and 3 minutes
    setTimeout(triggerRandomEvent, delay);
}

function triggerRandomEvent() {
    const r = Math.random();
    if (r < 0.35) {
        mysteryCustomerEvent();
    } else if (r < 0.6) {
        foodCriticEvent();
    } else if (r < 0.8) {
        healthInspectorEvent();
    } else {
        goldenShawarmaEvent();
    }
    scheduleRandomEvent();
}

function mysteryCustomerEvent() {
    const bonus = 100 + Math.floor(Math.random() * 400);
    shawarmas += bonus;
    logEvent(`A mystery customer orders a ridiculous amount: +${formatNumber(bonus)} shawarmas.`);
    updateUI();
}

function foodCriticEvent() {
    globalMultiplier *= 3;
    logEvent("A famous food critic arrived: 3× shawarmas for 15 seconds!");

    setTimeout(() => {
        globalMultiplier /= 3;
        logEvent("The critic left. Back to normal rates.");
        updateUI();
    }, 15000);

    updateUI();
}

function healthInspectorEvent() {
    globalMultiplier *= 0.7;
    logEvent("Health inspector found some issues: production reduced for 20 seconds.");

    setTimeout(() => {
        globalMultiplier /= 0.7;
        logEvent("You passed re-inspection. Production restored.");
        updateUI();
    }, 20000);

    updateUI();
}

function goldenShawarmaEvent() {
    goldenShawarmaBtn.classList.remove("hidden");
    logEvent("A Golden Shawarma appeared! Click it quickly!");

    // auto-hide after 15s if not clicked
    setTimeout(() => {
        goldenShawarmaBtn.classList.add("hidden");
    }, 15000);
}

goldenShawarmaBtn.addEventListener("click", () => {
    goldenShawarmaBtn.classList.add("hidden");
    const jackpot = 2000 + Math.floor(Math.random() * 4000);
    shawarmas += jackpot;
    totalShawarmas += jackpot;
    logEvent(`You clicked the Golden Shawarma! Jackpot: +${formatNumber(jackpot)}.`);
    updateUI();
});

scheduleRandomEvent();

// ------------------------
// Worlds
// ------------------------

switchWorldBtn.addEventListener("click", () => {
    if (currentWorld === 1 && shawarmas >= 5000) {
        currentWorld = 2;
        worldNameEl.textContent = "Kebab Kingdom";
        mainShawarmaEl.src = "images/kebab.png";
        logEvent("You expanded into Kebab Kingdom. New flavors, stronger customers.");
    } else if (currentWorld === 2) {
        currentWorld = 1;
        worldNameEl.textContent = "Shawarma Street";
        mainShawarmaEl.src = "images/shawarma.png";
        logEvent("Back to the original Shawarma Street.");
    }
});

// ------------------------
// Achievements
// ------------------------

function checkAchievements() {
    if (!achievements.first && totalShawarmas >= 1) {
        achievements.first = true;
        logEvent("Achievement unlocked: First Shawarma.");
    }
    if (!achievements.hundred && totalShawarmas >= 100) {
        achievements.hundred = true;
        logEvent("Achievement unlocked: 100 Shawarmas.");
    }
    if (!achievements.thousand && totalShawarmas >= 1000) {
        achievements.thousand = true;
        logEvent("Achievement unlocked: 1,000 Shawarmas.");
    }
    if (!achievements.tenThousand && totalShawarmas >= 10000) {
        achievements.tenThousand = true;
        logEvent("Achievement unlocked: 10,000 Shawarmas.");
    }
    if (!achievements.clickMaster && baseClickPower >= 50) {
        achievements.clickMaster = true;
        logEvent("Achievement unlocked: Click Master.");
    }
    if (!achievements.autoEmpire && baseAutoPower >= 100) {
        achievements.autoEmpire = true;
        logEvent("Achievement unlocked: Auto Empire.");
    }

    const allIngredientsCollected = Object.values(ingredients).every(x => x >= 1);
    if (!achievements.ingredientCollector && allIngredientsCollected) {
        achievements.ingredientCollector = true;
        logEvent("Achievement unlocked: Ingredient Collector.");
    }

    const someSecretUnlocked = Object.values(secrets).some(v => v);
    if (!achievements.secretFinder && someSecretUnlocked) {
        achievements.secretFinder = true;
        logEvent("Achievement unlocked: Secret Finder.");
    }

    if (!achievements.prestigeUnlocked && flavorPoints >= 1) {
        achievements.prestigeUnlocked = true;
        logEvent("Achievement unlocked: Prestige Unlocked.");
    }
}

// ------------------------
// Prestige system
// ------------------------

prestigeBtn.addEventListener("click", () => {
    if (shawarmas < 100000) return;

    // Calculate flavor points gained
    const gainedFlavor = Math.floor(Math.sqrt(totalShawarmas / 1000));
    if (gainedFlavor <= 0) return;

    flavorPoints += gainedFlavor;
    logEvent(`You rebuilt your shawarma empire. Gained ${gainedFlavor} Flavor Points.`);

    // Reset soft progress
    shawarmas = 0;
    totalShawarmas = 0;
    baseClickPower = 1;
    baseAutoPower = 0;
    clickMultiplier = 1;
    autoMultiplier = 1;
    globalMultiplier = 1;
    goldenWrapActive = false;

    // Costs reset to base
    costs.extraSauce = 20;
    costs.doubleGarlic = 150;
    costs.premiumPita = 800;
    costs.streetWorker = 50;
    costs.deliveryScooter = 400;
    costs.nightShift = 2000;
    costs.goldenWrap = 1500;
    costs.spiceMastery = 2500;

    // World back to 1
    currentWorld = 1;
    worldNameEl.textContent = "Shawarma Street";
    mainShawarmaEl.src = "images/shawarma.png";

    updateUI();
});

// Prestige upgrades

document.getElementById("prestigeQuantumShawarma").addEventListener("click", () => {
    const cost = costs.quantumShawarma;
    if (flavorPoints < cost) return;
    flavorPoints -= cost;
    prestigeGlobalBonus += 10;
    costs.quantumShawarma = Math.floor(cost * 1.7);
    logEvent("Prestige upgrade: Quantum Shawarma (+10% global gain).");
    updateUI();
});

document.getElementById("prestigeInfiniteSauce").addEventListener("click", () => {
    const cost = costs.infiniteSauce;
    if (flavorPoints < cost) return;
    flavorPoints -= cost;
    prestigeClickBonus += 20;
    costs.infiniteSauce = Math.floor(cost * 1.7);
    logEvent("Prestige upgrade: Infinite Sauce Pump (+20% click power).");
    updateUI();
});

document.getElementById("prestigeTimeChef").addEventListener("click", () => {
    const cost = costs.timeChef;
    if (flavorPoints < cost) return;
    flavorPoints -= cost;
    prestigeAutoBonus += 20;
    costs.timeChef = Math.floor(cost * 1.7);
    logEvent("Prestige upgrade: Time-Traveling Chef (+20% auto production).");
    updateUI();
});

// ------------------------
// Initial render
// ------------------------

updateUI();
