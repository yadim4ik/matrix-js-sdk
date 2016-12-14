"use strict";
console.log("Loading browser sdk");


/* simple object which replicates localstorage (without doing the storage bit) */
function DummyStore() {
}

DummyStore.prototype = {
    getItem: function(k) {
        return this[k] || null;
    },

    setItem: function(k, v) {
        this[k] = v;
    },

    removeItem: function(k) {
        delete this[k];
    },
};

function createClient(opts) {
    var sessionStore = new matrixcs.WebStorageSessionStore(new DummyStore());
    opts.sessionStore = sessionStore;
    return matrixcs.createClient(opts);
};

var client = createClient({
    baseUrl: "http://matrix.org",
});

client.publicRooms(function (err, data) {
    if (err) {
	   console.error("err %s", JSON.stringify(err));
       return;
    }
    console.log("data", data);
    var roomCount = data.total_room_count_estimate;
    console.log("Congratulations! The SDK is working on the browser!");
    var result = document.getElementById("result");
    result.innerHTML = "<p>The SDK appears to be working correctly. ("+
        roomCount + " rooms)</p>";
});

function login(form) {
    var result = document.getElementById("result");
    result.innerHTML = "<p>Logging in...</p>";

    var server = form.server.value;
    if (server != client.getHomeserverUrl()) {
        client = createClient({
            baseUrl: server,
        });
    }
    client.loginWithPassword(form.username.value, form.password.value).done(
        function(result) {
            client = createClient({
                baseUrl: server,
                userId: result.user_id,
                deviceId: result.device_id,
                accessToken: result.access_token,
            });
            setResult("Logged in. Device key: " + client.getDeviceEd25519Key());
        }, function(err) {
            setResult("Error logging in: " + err);
        }
    );
    return false;
}


function setResult(text) {
    var result = document.getElementById("result");
    result.innerHTML = "";
    var t = document.createTextNode(text);
    result.appendChild(t);
};
