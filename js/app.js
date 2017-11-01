var GITHUB_URL = "https://github.com/";
var GITHUB_API_URL = "https://api.github.com/";
var RELEASES = "/releases";
var ISSUES = "/issues";
var WRONG_FORMAL_URL = "not a correct formal url for software on github";
var SUCCESS = "success";
var FAIL = "fail";
var LOADING = "loading...";

function query() {
    if (!isInputValid()) {
        return;
    }
    var formalUrl = $.trim($("#input-formal-url").val());
    var githubInfo = {};
    try {
        githubInfo = getGithubInfoByFormalUrl(formalUrl);
    } catch (e) {
        alert(e.message);
        return;
    }
    githubInfo.version = $.trim($("#input-version").val());
    githubInfo.formalUrl = formalUrl;
    queryTagsByGithubInfo(githubInfo);
}

function isInputValid() {
    if (isBlank($("#input-formal-url").val()) || isBlank($("#input-version").val())) {
        alert("Formal url and version are both required !")
        return false;
    }
    return true;
}

function getGithubInfoByFormalUrl(formalUrl) {
    // must start with GITHUB_URL
    if (formalUrl.indexOf(GITHUB_URL) != 0) {
        throw new UserException(WRONG_FORMAL_URL);
    }
    var subStrAfterGithubUrl = formalUrl.substr(GITHUB_URL.length, formalUrl.length);
    var stringArray = subStrAfterGithubUrl.split("/");
    if (stringArray.length < 2 || isBlank(stringArray[0]) || isBlank(stringArray[1])) {
        throw new UserException(WRONG_FORMAL_URL);
    }
    return {
        owner: stringArray[0],
        repo: stringArray[1]
    };
}

function queryTagsByGithubInfo(githubInfo) {
	setMsg(LOADING);
    var tagsQueryUrl = GITHUB_API_URL + "repos/" + githubInfo.owner + "/" + githubInfo.repo + "/tags"
    $.getJSON(tagsQueryUrl, function(tags) {
        var isVersionExisted = false;
        for (var i = 0; i < tags.length; i++) {
            var tag = tags[i];
            if (tag.name == githubInfo.version) {
                isVersionExisted = true;
                var commitsQueryUrl = tag.commit.url;
                $.getJSON(commitsQueryUrl, function(commit) {
                    $("#software").html(githubInfo.repo);
                    $("#version").html(githubInfo.version);
                    $("#release-date").html(commit.commit.committer.date);
                    $("#formal-url").html(githubInfo.formalUrl);
                    $("#formal-url").attr("href", githubInfo.formalUrl);
                    $("#releases-history-page").html(githubInfo.formalUrl + RELEASES);
                    $("#releases-history-page").attr("href", githubInfo.formalUrl + RELEASES);
                    $("#issues-page").html(githubInfo.formalUrl + ISSUES);
                    $("#issues-page").attr("href", githubInfo.formalUrl + ISSUES);
                    setMsg(SUCCESS);
                }).fail(function() {
                	setMsg(FAIL);
                    alert("Query failed!");
                });
            }
        }
        if (!isVersionExisted) {
        	setMsg(FAIL);
            alert("Version is not existed!");
        }
    }).fail(function() {
    	setMsg(FAIL);
        alert("Formal url is not existed!");
    });
}

function UserException(message) {
    this.message = message;
    this.name = 'UserException';
}

function setMsg(info) {
    var color = "#000";
    switch (info) {
        case SUCCESS:
            color = "#0f0";
            break;
        case FAIL:
            color = "#f00";
            break;
        default:
            break;
    }
    $("#msg").html(info);
    $("#msg").css("color", color);
}