const Handlebars = require("handlebars");
const fs = require("fs");

Handlebars.registerHelper("inc", (value, _options) => parseInt(value, 10) + 1);

Handlebars.registerHelper("extn", (value, _options) => {
  const name = value.substring(0, value.lastIndexOf("@"));
  return name;
});

const sources = {
  APPROVED_TEMPLATE: fs
    .readFileSync(`${__dirname}/approvedRequest.hbs`, "utf8")
    .toString(),
  INPROGRESS_TEMPLATE: fs
    .readFileSync(`${__dirname}/inprogressRequest.hbs`, "utf8")
    .toString(),
  REJECTED_TEMPLATE: fs
    .readFileSync(`${__dirname}/rejectedRequest.hbs`, "utf8")
    .toString(),
  CANCELLED_TEMPLATE: fs
    .readFileSync(`${__dirname}/cancelledRequest.hbs`, "utf8")
    .toString(),
  PAST_REQUEST_AVAIL_TEMPLATE: fs
    .readFileSync(`${__dirname}/notifyPastRequestAvailable.hbs`, "utf8")
    .toString(),
};

const approveTemplate = Handlebars.compile(sources.APPROVED_TEMPLATE);
const inprogressTemplate = Handlebars.compile(sources.INPROGRESS_TEMPLATE);
const rejectedTemplate = Handlebars.compile(sources.REJECTED_TEMPLATE);
const cancelledTemplate = Handlebars.compile(sources.CANCELLED_TEMPLATE);
const pastRequestAvailTemplate = Handlebars.compile(
  sources.PAST_REQUEST_AVAIL_TEMPLATE
);
module.exports = {
  approveTemplate,
  inprogressTemplate,
  rejectedTemplate,
  cancelledTemplate,
  pastRequestAvailTemplate,
};
