var config = require("config");
var utility = require('../utility');
var classMapping = config.get('classes');

module.exports = function(accuser) {
  var addressBookLevel1 = accuser.addRepository('nus-cs2103-AY1617S1', 'addressbook-level1');
  var FormatCheckLabel = "FormatCheckRequested";

  var warnInvalidTitle = function(repo, issue) {
    if (hasNoFormatCheckRequestedLabel(issue)) {
      return;
    }

    accuser.addLabels(repo, issue, ["FormatCheckRequested"]);
    var comment = "Hi @" + issue.user.login + ", your pull request title is invalid."
      + " It should be in the format of `[Activity ID][Team ID] Your name`,"
      + " where `[Activity Id]` has no dashes or spaces (e.g. `[T2A3]` stands"
      + " for Tutorial 2 Activity 3) and `[Team ID]` has one dash only and no"
      + " spaces (e.g. `[W14-A2]` means Wednesday 2pm (14 hrs), Phase A, Team 2)."
      + " Please follow the instructions given strictly and edit your title for reprocessing."
      + "\n\nNote that this comment is posted by a bot sorting all the pull request submissions."
    accuser.comment(repo, issue, comment);
  };

  var hasNoFormatCheckRequestedLabel = function(issue) {
    var result = true;
    issue.labels.forEach(function(label){
      if (label.name === FormatCheckLabel) {
        result = false;
      }
    });
    return result;
  };

  addressBookLevel1.newWorker()
    .filter(function(repository, issue){
      // ensure that we only work with PRs that do not have an assignee
      return issue.assignee === null && issue.pull_request;
    })
    .do(function(repository, issue) {
      var result = utility._titleRegex.exec(issue.title);

      if (result === null) {
        // we ignore the PR if we cannot parse the title into our issuee-defined regex
        warnInvalidTitle(repository, issue);
        return;
      }

      var activityId = result[1];
      var classId = result[2];
      var teamId = result[4];

      if (!classMapping[classId]) {
        // the class ID fetched is invalid.
        warnInvalidTitle(repository, issue);
        return;
      }

      var tutor = classMapping[classId][teamId];
      if (tutor) {
        if (hasNoFormatCheckRequestedLabel(issue)) {
          accuser.removeLabel(repository, issue, FormatCheckLabel);
        }

        accuser.accuse(repository, issue, tutor);
      }
    });
};
