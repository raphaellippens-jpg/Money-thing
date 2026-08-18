/* =========================================================
   MONEY SYSTEM
   script.js
========================================================= */


/* =========================================================
   SETTINGS
========================================================= */

const ADMIN_USERNAME = "mom";


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "moneySystemAccounts";

let accounts =
    JSON.parse(
        localStorage.getItem(STORAGE_KEY)
    ) || {};

let currentUser = null;


/* =========================================================
   MONEY PRECISION
========================================================= */

function moneyToCents(amount) {

    return Math.round(
        amount * 100
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


/* =========================================================
   STORAGE FUNCTIONS
========================================================= */

function saveDatabase() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(accounts)
    );

}


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

        saved: 0

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


    if (
        key ===
        ADMIN_USERNAME.toLowerCase()
    ) {

        if (!accounts[key]) {

            accounts[key] = {

                username: ADMIN_USERNAME,

                password: password,

                admin: true,

                balance: 0,

                saved: 0

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
   NORMAL USER PANEL
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


    document.getElementById(
        "savedValue"
    ).textContent =
        "€" +
        cleanMoney(
            account.saved
        ).toFixed(2);

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
        Number(input);


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
        moneyToCents(amount);

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
   SAVE MONEY
========================================================= */

function saveMoney() {

    const input =
        prompt(
            "How much do you want to save?"
        );


    if (input === null) {
        return;
    }


    const amount =
        Number(input);


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
        moneyToCents(amount);

    const balanceCents =
        moneyToCents(
            account.balance
        );

    const savedCents =
        moneyToCents(
            account.saved
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


    account.saved =
        centsToMoney(
            savedCents +
            amountCents
        );


    saveDatabase();

    updateUserDisplay();


    showUserMessage(
        "Money saved!"
    );

}


/* =========================================================
   WITHDRAW
========================================================= */

function withdrawMoney() {

    const input =
        prompt(
            "How much do you want to withdraw?"
        );


    if (input === null) {
        return;
    }


    const amount =
        Number(input);


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
        moneyToCents(amount);

    const savedCents =
        moneyToCents(
            account.saved
        );

    const balanceCents =
        moneyToCents(
            account.balance
        );


    if (
        amountCents >
        savedCents
    ) {

        showUserMessage(
            "🚨 NOT ENOUGH SAVED MONEY!",
            true
        );

        return;
    }


    account.saved =
        centsToMoney(
            savedCents -
            amountCents
        );


    account.balance =
        centsToMoney(
            balanceCents +
            amountCents
        );


    saveDatabase();

    updateUserDisplay();


    showUserMessage(
        "Money withdrawn!"
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
   REFRESH MOM ACCOUNT LIST
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
            cleanMoney(
                account.saved
            ).toFixed(2);


        info.appendChild(name);

        info.appendChild(balance);

        info.appendChild(saved);


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


        div.appendChild(info);

        div.appendChild(buttons);


        list.appendChild(div);

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
        Number(input);


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
   USER DELETE OWN ACCOUNT
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
            "your account, Balance and Saved money."
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
   MOM DELETE OWN ACCOUNT
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
    .getElementById("loginButton")
    .addEventListener(
        "click",
        login
    );


document
    .getElementById("showCreateButton")
    .addEventListener(
        "click",
        showCreateAccount
    );


document
    .getElementById("createButton")
    .addEventListener(
        "click",
        createAccount
    );


document
    .getElementById("backToLoginButton")
    .addEventListener(
        "click",
        showLogin
    );


document
    .getElementById("buyButton")
    .addEventListener(
        "click",
        buyMoney
    );


document
    .getElementById("saveButton")
    .addEventListener(
        "click",
        saveMoney
    );


document
    .getElementById("withdrawButton")
    .addEventListener(
        "click",
        withdrawMoney
    );


document
    .getElementById("userLogoutButton")
    .addEventListener(
        "click",
        logout
    );


document
    .getElementById("adminLogoutButton")
    .addEventListener(
        "click",
        logout
    );


document
    .getElementById("deleteOwnAccountButton")
    .addEventListener(
        "click",
        deleteOwnAccount
    );


document
    .getElementById("deleteMomButton")
    .addEventListener(
        "click",
        deleteMomAccount
    );


/* =========================================================
   ENTER KEY LOGIN
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


/* =========================================================
   START
========================================================= */

showLogin();
