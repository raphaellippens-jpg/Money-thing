/* =========================================================
   MONEY SYSTEM
   localStorage + file vouchers + savings goals
========================================================= */


/* =========================================================
   SETTINGS
========================================================= */

const ADMIN_USERNAME = "mom";

const STORAGE_KEY =
    "moneySystemAccounts";

const USED_VOUCHERS_KEY =
    "moneySystemUsedVouchers";


/* =========================================================
   STORAGE
========================================================= */

let accounts =
    JSON.parse(
        localStorage.getItem(
            STORAGE_KEY
        )
    ) || {};


let usedVouchers =
    JSON.parse(
        localStorage.getItem(
            USED_VOUCHERS_KEY
        )
    ) || {};


let currentUser = null;


/* =========================================================
   MONEY
========================================================= */

function moneyToCents(amount) {

    return Math.round(
        Number(amount) * 100
    );

}


function centsToMoney(cents) {

    return cents / 100;

}


function cleanMoney(amount) {

    return centsToMoney(
        moneyToCents(amount)
    );

}


/* =========================================================
   STORAGE
========================================================= */

function saveDatabase() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(accounts)
    );

}


function saveUsedVouchers() {

    localStorage.setItem(
        USED_VOUCHERS_KEY,
        JSON.stringify(usedVouchers)
    );

}


/* =========================================================
   ACCOUNT MIGRATION
========================================================= */

/*
   Older accounts only had:

       saved: 2.54

   New accounts have:

       saved: 2.54
       safety: 2.54
       goals: []

   This function converts old accounts automatically.
*/

function migrateAccounts() {

    let changed = false;


    for (
        const key in accounts
    ) {

        const account =
            accounts[key];


        if (
            typeof account.safety !==
            "number"
        ) {

            account.safety =
                typeof account.saved ===
                "number"
                    ? account.saved
                    : 0;

            changed = true;

        }


        if (
            !Array.isArray(
                account.goals
            )
        ) {

            account.goals = [];

            changed = true;

        }


        if (
            typeof account.activeGoalId ===
            "undefined"
        ) {

            account.activeGoalId = null;

            changed = true;

        }


        if (
            typeof account.saved !==
            "number"
        ) {

            account.saved = 0;

            changed = true;

        }

    }


    if (changed) {

        saveDatabase();

    }

}


migrateAccounts();


/* =========================================================
   SAVINGS HELPERS
========================================================= */

function getSafetyCents(account) {

    return moneyToCents(
        account.safety || 0
    );

}


function getGoalCents(goal) {

    return moneyToCents(
        goal.amount || 0
    );

}


function getGoalTargetCents(goal) {

    return moneyToCents(
        goal.target || 0
    );

}


function getTotalSavedCents(account) {

    let total =
        getSafetyCents(
            account
        );


    if (
        Array.isArray(
            account.goals
        )
    ) {

        for (
            const goal of account.goals
        ) {

            total +=
                getGoalCents(
                    goal
                );

        }

    }


    return total;

}


function updateSavedCompatibilityValue(
    account
) {

    account.saved =
        centsToMoney(
            getTotalSavedCents(
                account
            )
        );

}


/* =========================================================
   ACTIVE GOAL
========================================================= */

function getActiveGoal(account) {

    if (
        !account.activeGoalId ||
        !Array.isArray(
            account.goals
        )
    ) {

        return null;

    }


    return (
        account.goals.find(
            function(goal) {

                return (
                    goal.id ===
                    account.activeGoalId
                );

            }
        ) || null
    );

}


function getGoalProgress(goal) {

    if (!goal) {
        return 0;
    }


    const target =
        getGoalTargetCents(
            goal
        );


    if (target <= 0) {
        return 0;
    }


    const amount =
        getGoalCents(
            goal
        );


    return Math.min(
        100,
        Math.floor(
            (
                amount /
                target
            ) * 100
        )
    );

}


function isGoalComplete(goal) {

    if (!goal) {
        return false;
    }


    return (
        getGoalCents(goal) >=
        getGoalTargetCents(goal)
    );

}


/* =========================================================
   ELEMENTS
========================================================= */

const loginScreen =
    document.getElementById(
        "loginScreen"
    );


const createScreen =
    document.getElementById(
        "createScreen"
    );


const userScreen =
    document.getElementById(
        "userScreen"
    );


const adminScreen =
    document.getElementById(
        "adminScreen"
    );


const loginUsername =
    document.getElementById(
        "loginUsername"
    );


const loginPassword =
    document.getElementById(
        "loginPassword"
    );


const newUsername =
    document.getElementById(
        "newUsername"
    );


const newPassword =
    document.getElementById(
        "newPassword"
    );


const loginMessage =
    document.getElementById(
        "loginMessage"
    );


const createMessage =
    document.getElementById(
        "createMessage"
    );


const userMessage =
    document.getElementById(
        "userMessage"
    );


const voucherFileInput =
    document.getElementById(
        "voucherFileInput"
    );


const savedBox =
    document.querySelector(
        ".savedBox"
    );


/* =========================================================
   SCREEN MANAGEMENT
========================================================= */

function hideAllScreens() {

    loginScreen.classList.add(
        "hidden"
    );

    createScreen.classList.add(
        "hidden"
    );

    userScreen.classList.add(
        "hidden"
    );

    adminScreen.classList.add(
        "hidden"
    );

}


function showLogin() {

    hideAllScreens();

    loginScreen.classList.remove(
        "hidden"
    );

}


function showCreateAccount() {

    hideAllScreens();

    createScreen.classList.remove(
        "hidden"
    );

}


/* =========================================================
   CREATE ACCOUNT
========================================================= */

function createAccount() {

    const username =
        newUsername.value.trim();


    const password =
        newPassword.value;


    createMessage.className =
        "message";


    if (!username || !password) {

        createMessage.classList.add(
            "error"
        );

        createMessage.textContent =
            "Enter a username and password.";

        return;
    }


    const key =
        username.toLowerCase();


    if (
        key ===
        ADMIN_USERNAME.toLowerCase()
    ) {

        createMessage.classList.add(
            "error"
        );

        createMessage.textContent =
            "That username is reserved.";

        return;
    }


    if (accounts[key]) {

        createMessage.classList.add(
            "error"
        );

        createMessage.textContent =
            "That username already exists.";

        return;
    }


    accounts[key] = {

        username: username,

        password: password,

        balance: 0,

        saved: 0,

        safety: 0,

        goals: [],

        activeGoalId: null

    };


    saveDatabase();


    createMessage.classList.add(
        "success"
    );


    createMessage.textContent =
        "Account created successfully!";


    newUsername.value = "";

    newPassword.value = "";

}


/* =========================================================
   LOGIN
========================================================= */

function login() {

    const username =
        loginUsername.value.trim();


    const password =
        loginPassword.value;


    loginMessage.className =
        "message";


    if (!username || !password) {

        loginMessage.classList.add(
            "error"
        );

        loginMessage.textContent =
            "Enter your username and password.";

        return;
    }


    const key =
        username.toLowerCase();


    /* MOM */

    if (
        key ===
        ADMIN_USERNAME.toLowerCase()
    ) {

        if (!accounts[key]) {

            accounts[key] = {

                username:
                    ADMIN_USERNAME,

                password:
                    password,

                admin:
                    true,

                balance:
                    0,

                saved:
                    0,

                safety:
                    0,

                goals:
                    [],

                activeGoalId:
                    null

            };


            saveDatabase();


            alert(
                "MOM admin account created!"
            );

        }


        if (
            accounts[key].password !==
            password
        ) {

            loginMessage.classList.add(
                "error"
            );

            loginMessage.textContent =
                "Incorrect MOM password.";

            return;
        }


        currentUser = key;

        showAdminPanel();

        return;
    }


    /* NORMAL USER */

    if (!accounts[key]) {

        loginMessage.classList.add(
            "error"
        );

        loginMessage.textContent =
            "Account does not exist.";

        return;
    }


    if (
        accounts[key].password !==
        password
    ) {

        loginMessage.classList.add(
            "error"
        );

        loginMessage.textContent =
            "Incorrect password.";

        return;
    }


    currentUser = key;

    showUserPanel();

}


/* =========================================================
   USER PANEL
========================================================= */

function showUserPanel() {

    hideAllScreens();

    userScreen.classList.remove(
        "hidden"
    );

    updateUserDisplay();

}


function updateUserDisplay() {

    const account =
        accounts[currentUser];


    if (!account) {
        return;
    }


    document.getElementById(
        "welcomeText"
    ).textContent =
        "Welcome, " +
        account.username +
        "!";


    document.getElementById(
        "balanceValue"
    ).textContent =
        "€" +
        cleanMoney(
            account.balance
        ).toFixed(2);


    updateSavedDisplay();


    updateSavedBoxClick();

}


/* =========================================================
   SAVED BOX DISPLAY
========================================================= */

function updateSavedDisplay() {

    const account =
        accounts[currentUser];


    if (!account) {
        return;
    }


    const savedElement =
        document.getElementById(
            "savedValue"
        );


    const totalSaved =
        getTotalSavedCents(
            account
        );


    savedElement.textContent =
        "€" +
        centsToMoney(
            totalSaved
        ).toFixed(2);


    updateSavedBoxPreview();

}


/* =========================================================
   SAVED BOX PREVIEW
========================================================= */

function updateSavedBoxPreview() {

    const account =
        accounts[currentUser];


    if (!account) {
        return;
    }


    const box =
        savedBox;


    if (!box) {
        return;
    }


    const oldPreview =
        box.querySelector(
            ".savedPreview"
        );


    if (oldPreview) {

        oldPreview.remove();

    }


    const preview =
        document.createElement(
            "div"
        );


    preview.className =
        "savedPreview";


    const activeGoal =
        getActiveGoal(
            account
        );


    const safety =
        getSafetyCents(
            account
        );


    if (activeGoal) {

        const goalLine =
            document.createElement(
                "div"
            );


        goalLine.textContent =
            "🎯 " +
            activeGoal.name;


        const progressLine =
            document.createElement(
                "div"
            );


        progressLine.textContent =
            "€" +
            centsToMoney(
                getGoalCents(
                    activeGoal
                )
            ).toFixed(2) +
            " / €" +
            centsToMoney(
                getGoalTargetCents(
                    activeGoal
                )
            ).toFixed(2) +
            " • " +
            getGoalProgress(
                activeGoal
            ) +
            "%";


        preview.appendChild(
            goalLine
        );

        preview.appendChild(
            progressLine
        );

    } else {

        const noGoal =
            document.createElement(
                "div"
            );


        noGoal.textContent =
            "🎯 No active goal";


        preview.appendChild(
            noGoal
        );

    }


    const safetyLine =
        document.createElement(
            "div"
        );


    safetyLine.textContent =
        "🛡️ Safety: €" +
        centsToMoney(
            safety
        ).toFixed(2);


    preview.appendChild(
        safetyLine
    );


    box.appendChild(
        preview
    );

}


/* =========================================================
   SAVED BOX CLICK
========================================================= */

function updateSavedBoxClick() {

    if (!savedBox) {
        return;
    }


    savedBox.style.cursor =
        "pointer";


    savedBox.title =
        "Open Savings";


    savedBox.onclick =
        openSavingsMenu;

}


/* =========================================================
   SAVINGS MENU
========================================================= */

function openSavingsMenu() {

    const account =
        accounts[currentUser];


    if (!account) {
        return;
    }


    const overlay =
        createModal(
            "🏦 SAVINGS"
        );


    const total =
        document.createElement(
            "div"
        );


    total.className =
        "savingsMenuTotal";


    total.textContent =
        "Total Saved: €" +
        centsToMoney(
            getTotalSavedCents(
                account
            )
        ).toFixed(2);


    overlay.content.appendChild(
        total
    );


    const safety =
        document.createElement(
            "div"
        );


    safety.className =
        "savingsMenuCard";


    safety.innerHTML =
        "<strong>🛡️ Safety Account</strong>" +
        "<br>€" +
        centsToMoney(
            getSafetyCents(
                account
            )
        ).toFixed(2);


    overlay.content.appendChild(
        safety
    );


    const goalsTitle =
        document.createElement(
            "h3"
        );


    goalsTitle.textContent =
        "🎯 GOALS";


    overlay.content.appendChild(
        goalsTitle
    );


    if (
        account.goals.length ===
        0
    ) {

        const none =
            document.createElement(
                "p"
            );


        none.textContent =
            "You don't have any goals yet.";


        overlay.content.appendChild(
            none
        );

    } else {

        for (
            const goal of account.goals
        ) {

            const card =
                createGoalCard(
                    account,
                    goal,
                    true
                );


            overlay.content.appendChild(
                card
            );

        }

    }


    const createGoalButton =
        createModalButton(
            "➕ CREATE GOAL",
            function() {

                closeModal(
                    overlay
                );

                createGoal();

            }
        );


    overlay.content.appendChild(
        createGoalButton
    );


    if (
        account.goals.length > 0
    ) {

        const changeActiveButton =
            createModalButton(
                "⭐ CHANGE ACTIVE GOAL",
                function() {

                    closeModal(
                        overlay
                    );

                    chooseActiveGoal();

                }
            );


        overlay.content.appendChild(
            changeActiveButton
        );

    }


    const closeButton =
        createModalButton(
            "CLOSE",
            function() {

                closeModal(
                    overlay
                );

            }
        );


    overlay.content.appendChild(
        closeButton
    );

}


/* =========================================================
   CREATE MODAL
========================================================= */

function createModal(title) {

    const overlay =
        document.createElement(
            "div"
        );


    overlay.className =
        "moneySystemModal";


    overlay.style.position =
        "fixed";


    overlay.style.inset =
        "0";


    overlay.style.background =
        "rgba(0,0,0,0.65)";


    overlay.style.display =
        "flex";


    overlay.style.alignItems =
        "center";


    overlay.style.justifyContent =
        "center";


    overlay.style.zIndex =
        "9999";


    const panel =
        document.createElement(
            "div"
        );


    panel.className =
        "moneySystemModalPanel";


    panel.style.background =
        "white";


    panel.style.color =
        "#111";


    panel.style.width =
        "min(92vw, 500px)";


    panel.style.maxHeight =
        "88vh";


    panel.style.overflowY =
        "auto";


    panel.style.borderRadius =
        "20px";


    panel.style.padding =
        "22px";


    panel.style.boxSizing =
        "border-box";


    const heading =
        document.createElement(
            "h2"
        );


    heading.textContent =
        title;


    panel.appendChild(
        heading
    );


    const content =
        document.createElement(
            "div"
        );


    content.className =
        "moneySystemModalContent";


    panel.appendChild(
        content
    );


    overlay.appendChild(
        panel
    );


    document.body.appendChild(
        overlay
    );


    overlay.content =
        content;


    overlay.panel =
        panel;


    return overlay;

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModal(overlay) {

    if (
        overlay &&
        overlay.parentNode
    ) {

        overlay.remove();

    }

}


/* =========================================================
   MODAL BUTTON
========================================================= */

function createModalButton(
    text,
    action
) {

    const button =
        document.createElement(
            "button"
        );


    button.textContent =
        text;


    button.style.display =
        "block";


    button.style.width =
        "100%";


    button.style.margin =
        "10px 0";


    button.style.padding =
        "14px";


    button.style.borderRadius =
        "12px";


    button.style.border =
        "none";


    button.style.cursor =
        "pointer";


    button.style.fontSize =
        "16px";


    button.addEventListener(
        "click",
        action
    );


    return button;

}


/* =========================================================
   GOAL CARD
========================================================= */

function createGoalCard(
    account,
    goal,
    showActions
) {

    const card =
        document.createElement(
            "div"
        );


    card.className =
        "savingsGoalCard";


    card.style.border =
        "1px solid #ddd";


    card.style.borderRadius =
        "14px";


    card.style.padding =
        "14px";


    card.style.marginBottom =
        "12px";


    const isActive =
        account.activeGoalId ===
        goal.id;


    const amount =
        getGoalCents(
            goal
        );


    const target =
        getGoalTargetCents(
            goal
        );


    const progress =
        getGoalProgress(
            goal
        );


    const title =
        document.createElement(
            "div"
        );


    title.style.fontWeight =
        "bold";


    title.style.fontSize =
        "18px";


    title.textContent =
        "🎯 " +
        goal.name;


    if (isActive) {

        title.textContent +=
            " ⭐ ACTIVE";

    }


    card.appendChild(
        title
    );


    const amountText =
        document.createElement(
            "div"
        );


    amountText.textContent =
        "€" +
        centsToMoney(
            amount
        ).toFixed(2) +
        " / €" +
        centsToMoney(
            target
        ).toFixed(2) +
        " • " +
        progress +
        "%";


    card.appendChild(
        amountText
    );


    const progressOuter =
        document.createElement(
            "div"
        );


    progressOuter.style.width =
        "100%";


    progressOuter.style.height =
        "12px";


    progressOuter.style.background =
        "#ddd";


    progressOuter.style.borderRadius =
        "10px";


    progressOuter.style.margin =
        "10px 0";


    progressOuter.style.overflow =
        "hidden";


    const progressInner =
        document.createElement(
            "div"
        );


    progressInner.style.width =
        progress +
        "%";


    progressInner.style.height =
        "100%";


    progressInner.style.background =
        "#4CAF50";


    progressOuter.appendChild(
        progressInner
    );


    card.appendChild(
        progressOuter
    );


    if (
        isGoalComplete(goal)
    ) {

        const complete =
            document.createElement(
                "div"
            );


        complete.textContent =
            "🏆 GOAL COMPLETE";


        complete.style.fontWeight =
            "bold";


        card.appendChild(
            complete
        );

    }


    if (showActions) {

        const buttonRow =
            document.createElement(
                "div"
            );


        buttonRow.style.display =
            "flex";


        buttonRow.style.gap =
            "8px";


        buttonRow.style.flexWrap =
            "wrap";


        if (!isActive) {

            const activate =
                createModalButton(
                    "⭐ MAKE ACTIVE",
                    function() {

                        account.activeGoalId =
                            goal.id;


                        saveDatabase();

                        closeAllModals();

                        updateUserDisplay();

                        openSavingsMenu();

                    }
                );


            activate.style.flex =
                "1";


            buttonRow.appendChild(
                activate
            );

        }


        const deleteButton =
            createModalButton(
                "🗑️ DELETE",
                function() {

                    deleteGoal(
                        account,
                        goal.id
                    );

                }
            );


        deleteButton.style.flex =
            "1";


        buttonRow.appendChild(
            deleteButton
        );


        card.appendChild(
            buttonRow
        );

    }


    return card;

}


/* =========================================================
   CLOSE ALL MODALS
========================================================= */

function closeAllModals() {

    document
        .querySelectorAll(
            ".moneySystemModal"
        )
        .forEach(
            function(modal) {

                modal.remove();

            }
        );

}


/* =========================================================
   CREATE GOAL
========================================================= */

function createGoal() {

    const account =
        accounts[currentUser];


    const name =
        prompt(
            "What is the name of your goal?"
        );


    if (
        name === null
    ) {

        return;

    }


    const cleanName =
        name.trim();


    if (!cleanName) {

        showUserMessage(
            "Enter a goal name.",
            true
        );

        return;

    }


    const targetInput =
        prompt(
            "How much money do you need for this goal?"
        );


    if (
        targetInput === null
    ) {

        return;

    }


    const target =
        Number(
            targetInput.replace(
                ",",
                "."
            )
        );


    const targetCents =
        moneyToCents(
            target
        );


    if (
        !Number.isFinite(target) ||
        targetCents <= 0
    ) {

        showUserMessage(
            "Enter a valid target amount.",
            true
        );

        return;

    }


    const goal = {

        id:
            createGoalID(),

        name:
            cleanName,

        target:
            centsToMoney(
                targetCents
            ),

        amount:
            0,

        createdAt:
            new Date().toISOString()

    };


    account.goals.push(
        goal
    );


    /*
       If there isn't an active goal,
       the first goal automatically
       becomes active.
    */

    if (
        !account.activeGoalId
    ) {

        account.activeGoalId =
            goal.id;

    }


    updateSavedCompatibilityValue(
        account
    );


    saveDatabase();


    updateUserDisplay();


    showUserMessage(
        "🎯 Goal created!"
    );


    openSavingsMenu();

}


/* =========================================================
   GOAL ID
========================================================= */

function createGoalID() {

    if (
        window.crypto &&
        crypto.randomUUID
    ) {

        return crypto.randomUUID();

    }


    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 12)
    );

}


/* =========================================================
   CHOOSE ACTIVE GOAL
========================================================= */

function chooseActiveGoal() {

    const account =
        accounts[currentUser];


    if (
        account.goals.length ===
        0
    ) {

        showUserMessage(
            "You don't have any goals yet.",
            true
        );

        return;

    }


    const overlay =
        createModal(
            "⭐ CHOOSE ACTIVE GOAL"
        );


    for (
        const goal of account.goals
    ) {

        const button =
            createModalButton(
                (
                    account.activeGoalId ===
                    goal.id
                        ? "⭐ "
                        : "🎯 "
                ) +
                goal.name +
                " — " +
                getGoalProgress(
                    goal
                ) +
                "%",
                function() {

                    account.activeGoalId =
                        goal.id;


                    saveDatabase();

                    closeModal(
                        overlay
                    );

                    updateUserDisplay();

                    showUserMessage(
                        "⭐ Active goal changed!"
                    );

                }
            );


        overlay.content.appendChild(
            button
        );

    }


    const closeButton =
        createModalButton(
            "CLOSE",
            function() {

                closeModal(
                    overlay
                );

            }
        );


    overlay.content.appendChild(
        closeButton
    );

}


/* =========================================================
   DELETE GOAL
========================================================= */

function deleteGoal(
    account,
    goalId
) {

    const goal =
        account.goals.find(
            function(item) {

                return (
                    item.id ===
                    goalId
                );

            }
        );


    if (!goal) {
        return;
    }


    const goalAmount =
        getGoalCents(
            goal
        );


    if (
        goalAmount > 0
    ) {

        showUserMessage(
            "You can't delete a goal containing money.",
            true
        );

        return;

    }


    const confirmed =
        confirm(
            "Delete the goal '" +
            goal.name +
            "'?"
        );


    if (!confirmed) {
        return;
    }


    account.goals =
        account.goals.filter(
            function(item) {

                return (
                    item.id !==
                    goalId
                );

            }
        );


    if (
        account.activeGoalId ===
        goalId
    ) {

        if (
            account.goals.length >
            0
        ) {

            account.activeGoalId =
                account.goals[0].id;

        } else {

            account.activeGoalId =
                null;

        }

    }


    saveDatabase();

    updateUserDisplay();

    closeAllModals();

    openSavingsMenu();

}


/* =========================================================
   SAVE MONEY
========================================================= */

function saveMoney() {

    const account =
        accounts[currentUser];


    const overlay =
        createModal(
            "🟢 SAVE MONEY"
        );


    const text =
        document.createElement(
            "p"
        );


    text.textContent =
        "Where do you want to save the money?";


    overlay.content.appendChild(
        text
    );


    const activeGoal =
        getActiveGoal(
            account
        );


    if (activeGoal) {

        const goalButton =
            createModalButton(
                "🎯 " +
                activeGoal.name,
                function() {

                    closeModal(
                        overlay
                    );

                    saveToActiveGoal();

                }
            );


        overlay.content.appendChild(
            goalButton
        );

    } else {

        const noGoal =
            document.createElement(
                "p"
            );


        noGoal.textContent =
            "You don't have an active goal.";


        overlay.content.appendChild(
            noGoal
        );

    }


    const safetyButton =
        createModalButton(
            "🛡️ SAFETY ACCOUNT",
            function() {

                closeModal(
                    overlay
                );

                saveToSafety();

            }
        );


    overlay.content.appendChild(
        safetyButton
    );


    const closeButton =
        createModalButton(
            "CANCEL",
            function() {

                closeModal(
                    overlay
                );

            }
        );


    overlay.content.appendChild(
        closeButton
    );

}


/* =========================================================
   SAVE TO SAFETY
========================================================= */

function saveToSafety() {

    const account =
        accounts[currentUser];


    const input =
        prompt(
            "How much do you want to save to the Safety Account?"
        );


    if (
        input === null
    ) {

        return;

    }


    const amount =
        Number(
            input.replace(
                ",",
                "."
            )
        );


    const amountCents =
        moneyToCents(
            amount
        );


    if (
        !Number.isFinite(amount) ||
        amountCents <= 0
    ) {

        showUserMessage(
            "Enter a valid amount.",
            true
        );

        return;

    }


    const balanceCents =
        moneyToCents(
            account.balance
        );


    if (
        amountCents >
        balanceCents
    ) {

        showUserMessage(
            "🚨 INSUFFICIENT FUNDS!",
            true
        );

        return;

    }


    account.balance =
        centsToMoney(
            balanceCents -
            amountCents
        );


    account.safety =
        centsToMoney(
            getSafetyCents(
                account
            ) +
            amountCents
        );


    updateSavedCompatibilityValue(
        account
    );


    saveDatabase();

    updateUserDisplay();


    showUserMessage(
        "🛡️ Money saved to Safety Account!"
    );

}


/* =========================================================
   SAVE TO ACTIVE GOAL
========================================================= */

function saveToActiveGoal() {

    const account =
        accounts[currentUser];


    const goal =
        getActiveGoal(
            account
        );


    if (!goal) {

        showUserMessage(
            "You don't have an active goal.",
            true
        );

        return;

    }


    if (
        isGoalComplete(
            goal
        )
    ) {

        showUserMessage(
            "🏆 This goal is already complete!",
            true
        );

        return;

    }


    const remainingCents =
        getGoalTargetCents(
            goal
        ) -
        getGoalCents(
            goal
        );


    const input =
        prompt(
            "How much do you want to save toward '" +
            goal.name +
            "'?\n\n" +
            "Remaining: €" +
            centsToMoney(
                remainingCents
            ).toFixed(2)
        );


    if (
        input === null
    ) {

        return;

    }


    const amount =
        Number(
            input.replace(
                ",",
                "."
            )
        );


    const amountCents =
        moneyToCents(
            amount
        );


    if (
        !Number.isFinite(amount) ||
        amountCents <= 0
    ) {

        showUserMessage(
            "Enter a valid amount.",
            true
        );

        return;

    }


    if (
        amountCents >
        remainingCents
    ) {

        showUserMessage(
            "That would put the goal over its target.",
            true
        );

        return;

    }


    const balanceCents =
        moneyToCents(
            account.balance
        );


    if (
        amountCents >
        balanceCents
    ) {

        showUserMessage(
            "🚨 INSUFFICIENT FUNDS!",
            true
        );

        return;

    }


    account.balance =
        centsToMoney(
            balanceCents -
            amountCents
        );


    goal.amount =
        centsToMoney(
            getGoalCents(
                goal
            ) +
            amountCents
        );


    updateSavedCompatibilityValue(
        account
    );


    saveDatabase();

    updateUserDisplay();


    if (
        isGoalComplete(
            goal
        )
    ) {

        showUserMessage(
            "🏆 GOAL COMPLETE!"
        );

    } else {

        showUserMessage(
            "🎯 Money added to goal!"
        );

    }

}


/* =========================================================
   WITHDRAW MONEY
========================================================= */

function withdrawMoney() {

    const account =
        accounts[currentUser];


    const overlay =
        createModal(
            "🟣 WITHDRAW"
        );


    const text =
        document.createElement(
            "p"
        );


    text.textContent =
        "Where do you want to withdraw money from?";


    overlay.content.appendChild(
        text
    );


    const safetyButton =
        createModalButton(
            "🛡️ SAFETY ACCOUNT — €" +
            centsToMoney(
                getSafetyCents(
                    account
                )
            ).toFixed(2),
            function() {

                closeModal(
                    overlay
                );

                withdrawFromSafety();

            }
        );


    overlay.content.appendChild(
        safetyButton
    );


    const completedGoals =
        account.goals.filter(
            function(goal) {

                return isGoalComplete(
                    goal
                );

            }
        );


    if (
        completedGoals.length > 0
    ) {

        const title =
            document.createElement(
                "h3"
            );


        title.textContent =
            "🏆 COMPLETED GOALS";


        overlay.content.appendChild(
            title
        );


        for (
            const goal of completedGoals
        ) {

            const goalButton =
                createModalButton(
                    "🎯 " +
                    goal.name +
                    " — €" +
                    centsToMoney(
                        getGoalCents(
                            goal
                        )
                    ).toFixed(2),
                    function() {

                        closeModal(
                            overlay
                        );

                        withdrawFromGoal(
                            goal.id
                        );

                    }
                );


            overlay.content.appendChild(
                goalButton
            );

        }

    } else {

        const noGoals =
            document.createElement(
                "p"
            );


        noGoals.textContent =
            "🎯 No completed goals available yet.";


        overlay.content.appendChild(
            noGoals
        );

    }


    const closeButton =
        createModalButton(
            "CANCEL",
            function() {

                closeModal(
                    overlay
                );

            }
        );


    overlay.content.appendChild(
        closeButton
    );

}


/* =========================================================
   WITHDRAW FROM SAFETY
========================================================= */

function withdrawFromSafety() {

    const account =
        accounts[currentUser];


    const safetyCents =
        getSafetyCents(
            account
        );


    if (
        safetyCents <= 0
    ) {

        showUserMessage(
            "🛡️ Safety Account is empty.",
            true
        );

        return;

    }


    const input =
        prompt(
            "How much do you want to withdraw from the Safety Account?\n\n" +
            "Available: €" +
            centsToMoney(
                safetyCents
            ).toFixed(2)
        );


    if (
        input === null
    ) {

        return;

    }


    const amount =
        Number(
            input.replace(
                ",",
                "."
            )
        );


    const amountCents =
        moneyToCents(
            amount
        );


    if (
        !Number.isFinite(amount) ||
        amountCents <= 0
    ) {

        showUserMessage(
            "Enter a valid amount.",
            true
        );

        return;

    }


    if (
        amountCents >
        safetyCents
    ) {

        showUserMessage(
            "🚨 NOT ENOUGH MONEY IN SAFETY ACCOUNT!",
            true
        );

        return;

    }


    account.safety =
        centsToMoney(
            safetyCents -
            amountCents
        );


    account.balance =
        centsToMoney(
            moneyToCents(
                account.balance
            ) +
            amountCents
        );


    updateSavedCompatibilityValue(
        account
    );


    saveDatabase();

    updateUserDisplay();


    showUserMessage(
        "🛡️ Money withdrawn from Safety Account!"
    );

}


/* =========================================================
   WITHDRAW FROM GOAL
========================================================= */

function withdrawFromGoal(
    goalId
) {

    const account =
        accounts[currentUser];


    const goal =
        account.goals.find(
            function(item) {

                return (
                    item.id ===
                    goalId
                );

            }
        );


    if (!goal) {

        showUserMessage(
            "Goal not found.",
            true
        );

        return;

    }


    if (
        !isGoalComplete(
            goal
        )
    ) {

        showUserMessage(
            "🚨 THIS GOAL ISN'T COMPLETE YET!",
            true
        );

        return;

    }


    const amountCents =
        getGoalCents(
            goal
        );


    const confirmed =
        confirm(
            "🏆 " +
            goal.name +
            "\n\n" +
            "Withdraw €" +
            centsToMoney(
                amountCents
            ).toFixed(2) +
            " from this completed goal?"
        );


    if (!confirmed) {
        return;
    }


    account.balance =
        centsToMoney(
            moneyToCents(
                account.balance
            ) +
            amountCents
        );


    /*
       Goal stays there after withdrawal,
       but its amount resets to zero.
       This lets you reuse the goal.
    */

    goal.amount =
        0;


    updateSavedCompatibilityValue(
        account
    );


    saveDatabase();

    updateUserDisplay();


    showUserMessage(
        "🏆 Goal money withdrawn!"
    );

}


/* =========================================================
   BUY
========================================================= */

function buyMoney() {

    const input =
        prompt(
            "How much do you want to buy?"
        );


    if (input === null) {
        return;
    }


    const amount =
        Number(
            input.replace(",", ".")
        );


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showUserMessage(
            "Enter a valid amount.",
            true
        );

        return;
    }


    const account =
        accounts[currentUser];


    const amountCents =
        moneyToCents(
            amount
        );


    const balanceCents =
        moneyToCents(
            account.balance
        );


    if (
        amountCents >
        balanceCents
    ) {

        showUserMessage(
            "🚨 INSUFFICIENT FUNDS!",
            true
        );

        return;
    }


    account.balance =
        centsToMoney(
            balanceCents -
            amountCents
        );


    saveDatabase();

    updateUserDisplay();


    showUserMessage(
        "Purchase successful!"
    );

}


/* =========================================================
   USER MESSAGE
========================================================= */

function showUserMessage(
    text,
    error = false
) {

    userMessage.className =
        "message";


    if (error) {

        userMessage.classList.add(
            "error"
        );

    } else {

        userMessage.classList.add(
            "success"
        );

    }


    userMessage.textContent =
        text;


    setTimeout(
        function() {

            userMessage.textContent =
                "";

        },
        2500
    );

}


/* =========================================================
   MOM PANEL
========================================================= */

function showAdminPanel() {

    hideAllScreens();

    adminScreen.classList.remove(
        "hidden"
    );

    refreshAdminPanel();

}


/* =========================================================
   ACCOUNT LIST
========================================================= */

function refreshAdminPanel() {

    const list =
        document.getElementById(
            "accountList"
        );


    list.innerHTML = "";


    for (
        const key in accounts
    ) {

        if (
            key ===
            ADMIN_USERNAME.toLowerCase()
        ) {

            continue;
        }


        const account =
            accounts[key];


        const div =
            document.createElement(
                "div"
            );


        div.className =
            "account";


        const info =
            document.createElement(
                "div"
            );


        info.className =
            "accountInfo";


        const name =
            document.createElement(
                "div"
            );


        name.className =
            "accountName";


        name.textContent =
            "👤 " +
            account.username;


        const balance =
            document.createElement(
                "div"
            );


        balance.className =
            "accountMoney";


        balance.textContent =
            "💶 Balance: €" +
            cleanMoney(
                account.balance
            ).toFixed(2);


        const saved =
            document.createElement(
                "div"
            );


        saved.className =
            "accountMoney";


        saved.textContent =
            "🏦 Saved: €" +
            centsToMoney(
                getTotalSavedCents(
                    account
                )
            ).toFixed(2);


        info.appendChild(
            name
        );


        info.appendChild(
            balance
        );


        info.appendChild(
            saved
        );


        const buttons =
            document.createElement(
                "div"
            );


        buttons.className =
            "adminButtons";


        const increaseButton =
            document.createElement(
                "button"
            );


        increaseButton.className =
            "increase";


        increaseButton.textContent =
            "➕ Increase balance";


        increaseButton.addEventListener(
            "click",
            function() {

                increaseBalance(key);

            }
        );


        const deleteButton =
            document.createElement(
                "button"
            );


        deleteButton.className =
            "delete";


        deleteButton.textContent =
            "🗑️ Delete account";


        deleteButton.addEventListener(
            "click",
            function() {

                deleteAccount(key);

            }
        );


        buttons.appendChild(
            increaseButton
        );


        buttons.appendChild(
            deleteButton
        );


        div.appendChild(
            info
        );


        div.appendChild(
            buttons
        );


        list.appendChild(
            div
        );

    }

}


/* =========================================================
   MOM: INCREASE BALANCE
========================================================= */

function increaseBalance(key) {

    const account =
        accounts[key];


    if (!account) {
        return;
    }


    const input =
        prompt(
            "Add money to " +
            account.username +
            "'s balance:"
        );


    if (input === null) {
        return;
    }


    const amount =
        Number(
            input.replace(",", ".")
        );


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        alert(
            "Enter a valid amount."
        );

        return;
    }


    const balanceCents =
        moneyToCents(
            account.balance
        );


    const amountCents =
        moneyToCents(
            amount
        );


    account.balance =
        centsToMoney(
            balanceCents +
            amountCents
        );


    saveDatabase();

    refreshAdminPanel();


    alert(
        "Added €" +
        centsToMoney(
            amountCents
        ).toFixed(2) +
        " to " +
        account.username +
        "'s balance."
    );

}


/* =========================================================
   MOM: DELETE ACCOUNT
========================================================= */

function deleteAccount(key) {

    const account =
        accounts[key];


    if (!account) {
        return;
    }


    if (
        key ===
        ADMIN_USERNAME.toLowerCase()
    ) {

        alert(
            "The MOM account cannot be deleted here."
        );

        return;
    }


    const confirmed =
        confirm(
            "Delete the account '" +
            account.username +
            "'?\n\n" +
            "This will permanently remove " +
            "its Balance and Saved money."
        );


    if (!confirmed) {
        return;
    }


    delete accounts[key];


    saveDatabase();

    refreshAdminPanel();


    alert(
        "Account deleted."
    );

}


/* =========================================================
   DELETE OWN ACCOUNT
========================================================= */

function deleteOwnAccount() {

    if (!currentUser) {
        return;
    }


    const account =
        accounts[currentUser];


    const confirmed =
        confirm(
            "Delete your account '" +
            account.username +
            "'?\n\n" +
            "This will permanently delete " +
            "your Balance and Saved money."
        );


    if (!confirmed) {
        return;
    }


    delete accounts[currentUser];


    saveDatabase();


    currentUser = null;


    alert(
        "Your account has been deleted."
    );


    showLogin();

}


/* =========================================================
   DELETE MOM ACCOUNT
========================================================= */

function deleteMomAccount() {

    if (!currentUser) {
        return;
    }


    const account =
        accounts[currentUser];


    if (!account.admin) {
        return;
    }


    const confirmed =
        confirm(
            "Delete the MOM account?\n\n" +
            "This will permanently delete " +
            "the MOM account."
        );


    if (!confirmed) {
        return;
    }


    delete accounts[currentUser];


    saveDatabase();


    currentUser = null;


    alert(
        "MOM account deleted."
    );


    showLogin();

}


/* =========================================================
   VOUCHER ID
========================================================= */

function createVoucherID() {

    if (
        window.crypto &&
        crypto.randomUUID
    ) {

        return crypto.randomUUID();

    }


    return (
        Date.now().toString(36) +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 12)
    );

}


/* =========================================================
   CREATE MONEY VOUCHER
========================================================= */

function createMoneyVoucher() {

    const input =
        prompt(
            "What amount should the voucher contain?"
        );


    if (input === null) {
        return;
    }


    const amount =
        Number(
            input.replace(",", ".")
        );


    const amountCents =
        moneyToCents(
            amount
        );


    if (
        !Number.isFinite(amount) ||
        amountCents <= 0
    ) {

        alert(
            "Enter a valid amount."
        );

        return;
    }


    const voucher = {

        type:
            "MONEY_SYSTEM_VOUCHER",

        version:
            1,

        voucherId:
            createVoucherID(),

        amountCents:
            amountCents,

        redeemed:
            false,

        createdBy:
            ADMIN_USERNAME,

        createdAt:
            new Date().toISOString()

    };


    const contents =
        JSON.stringify(
            voucher,
            null,
            2
        );


    const blob =
        new Blob(
            [
                contents
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "MoneyVoucher-" +
        centsToMoney(
            amountCents
        ).toFixed(2) +
        ".msv";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );


    alert(
        "🎟️ VOUCHER CREATED!\n\n" +
        "Amount: €" +
        centsToMoney(
            amountCents
        ).toFixed(2) +
        "\n\n" +
        "Send the .msv file to the person."
    );

}


/* =========================================================
   OPEN VOUCHER PICKER
========================================================= */

function openVoucherPicker() {

    voucherFileInput.value = "";

    voucherFileInput.click();

}


/* =========================================================
   REDEEM VOUCHER
========================================================= */

async function redeemVoucherFromFile(event) {

    const file =
        event.target.files[0];


    if (!file) {
        return;
    }


    try {

        const text =
            await file.text();


        const voucher =
            JSON.parse(
                text
            );


        if (
            voucher.type !==
            "MONEY_SYSTEM_VOUCHER"
        ) {

            throw new Error(
                "Invalid voucher."
            );
        }


        if (
            voucher.version !== 1
        ) {

            throw new Error(
                "Unsupported voucher version."
            );
        }


        if (
            !voucher.voucherId
        ) {

            throw new Error(
                "Voucher has no ID."
            );
        }


        const amountCents =
            Number(
                voucher.amountCents
            );


        if (
            !Number.isInteger(
                amountCents
            ) ||
            amountCents <= 0
        ) {

            throw new Error(
                "Invalid voucher amount."
            );
        }


        if (
            voucher.redeemed === true
        ) {

            showUserMessage(
                "🚨 VOUCHER ALREADY REDEEMED!",
                true
            );

            return;
        }


        if (
            usedVouchers[
                voucher.voucherId
            ]
        ) {

            showUserMessage(
                "🚨 VOUCHER ALREADY USED!",
                true
            );

            return;
        }


        const confirmed =
            confirm(
                "🎟️ MONEY VOUCHER\n\n" +
                "Amount: €" +
                centsToMoney(
                    amountCents
                ).toFixed(2) +
                "\n\n" +
                "Redeem this voucher?"
            );


        if (!confirmed) {
            return;
        }


        const account =
            accounts[currentUser];


        const balanceCents =
            moneyToCents(
                account.balance
            );


        account.balance =
            centsToMoney(
                balanceCents +
                amountCents
            );


        usedVouchers[
            voucher.voucherId
        ] = {

            amountCents:
                amountCents,

            redeemedAt:
                new Date().toISOString()

        };


        saveDatabase();

        saveUsedVouchers();


        voucher.redeemed =
            true;


        voucher.redeemedBy =
            account.username;


        voucher.redeemedAt =
            new Date().toISOString();


        const redeemedContents =
            JSON.stringify(
                voucher,
                null,
                2
            );


        const redeemedBlob =
            new Blob(
                [
                    redeemedContents
                ],
                {
                    type:
                        "application/json"
                }
            );


        const redeemedURL =
            URL.createObjectURL(
                redeemedBlob
            );


        const redeemedLink =
            document.createElement(
                "a"
            );


        redeemedLink.href =
            redeemedURL;


        redeemedLink.download =
            "REDEEMED-MoneyVoucher-" +
            centsToMoney(
                amountCents
            ).toFixed(2) +
            ".msv";


        document.body.appendChild(
            redeemedLink
        );


        redeemedLink.click();


        redeemedLink.remove();


        URL.revokeObjectURL(
            redeemedURL
        );


        updateUserDisplay();


        showUserMessage(
            "💰 €" +
            centsToMoney(
                amountCents
            ).toFixed(2) +
            " ADDED!"
        );


    } catch (error) {

        console.error(
            "Voucher error:",
            error
        );


        showUserMessage(
            "🚨 INVALID VOUCHER FILE!",
            true
        );

    }

}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    currentUser = null;


    loginUsername.value = "";

    loginPassword.value = "";

    loginMessage.textContent = "";


    showLogin();

}


/* =========================================================
   BUTTON CONNECTIONS
========================================================= */

document
    .getElementById(
        "loginButton"
    )
    .addEventListener(
        "click",
        login
    );


document
    .getElementById(
        "showCreateButton"
    )
    .addEventListener(
        "click",
        showCreateAccount
    );


document
    .getElementById(
        "createButton"
    )
    .addEventListener(
        "click",
        createAccount
    );


document
    .getElementById(
        "backToLoginButton"
    )
    .addEventListener(
        "click",
        showLogin
    );


document
    .getElementById(
        "buyButton"
    )
    .addEventListener(
        "click",
        buyMoney
    );


document
    .getElementById(
        "saveButton"
    )
    .addEventListener(
        "click",
        saveMoney
    );


document
    .getElementById(
        "withdrawButton"
    )
    .addEventListener(
        "click",
        withdrawMoney
    );


document
    .getElementById(
        "userLogoutButton"
    )
    .addEventListener(
        "click",
        logout
    );


document
    .getElementById(
        "adminLogoutButton"
    )
    .addEventListener(
        "click",
        logout
    );


document
    .getElementById(
        "deleteOwnAccountButton"
    )
    .addEventListener(
        "click",
        deleteOwnAccount
    );


document
    .getElementById(
        "deleteMomButton"
    )
    .addEventListener(
        "click",
        deleteMomAccount
    );


document
    .getElementById(
        "createVoucherButton"
    )
    .addEventListener(
        "click",
        createMoneyVoucher
    );


document
    .getElementById(
        "redeemVoucherButton"
    )
    .addEventListener(
        "click",
        openVoucherPicker
    );


voucherFileInput.addEventListener(
    "change",
    redeemVoucherFromFile
);


/* =========================================================
   ENTER KEY
========================================================= */

loginPassword.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Enter"
        ) {

            login();

        }

    }
);


newPassword.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Enter"
        ) {

            createAccount();

        }

    }
);


/* =========================================================
   START
========================================================= */

showLogin();
