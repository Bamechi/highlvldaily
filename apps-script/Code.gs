/**
 * HIGH - LVL DAILY · intake router
 * One web app, one spreadsheet, four tabs. Paste this whole file into Code.gs,
 * Deploy → Manage deployments → Edit → Version: New version → Deploy.
 * (Every code change needs a NEW VERSION on the same deployment or the site keeps hitting the old code.)
 */

const SHEET_ID = "1vB5Od_GE19WvzdEjzP24ydEp6Abr0h0OiwBWNRjAiFo";

// form name sent by the site  →  tab name in the sheet
const TABS = {
  topic:      "Pitch a topic",
  advertise:  "07 Advertise",
  invest:     "08 invest",
  newsletter: "10 Newsletter"
};

// header text in row 1 (lower-cased)  →  which field(s) from the site fill it
const ALIASES = {
  "name":         ["name"],
  "email":        ["email"],
  "topic":        ["topic"],
  "notes":        ["notes", "note", "line"],
  "note":         ["note", "notes", "line"],
  "ziion member": ["ziion"],
  "brand":        ["brand"],
  "budget":       ["budget"],
  "category":     ["category"],
  "organization": ["org", "organization"],
  "interest":     ["interest"],
  "timestamp":    ["ts"],
  "page":         ["page"],
  "form":         ["form"]
};

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const tabName = TABS[data.form] || "Unrouted";
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sh = ss.getSheetByName(tabName);
    if (!sh) { sh = ss.insertSheet(tabName); sh.appendRow(["Form", "Name", "Email", "Notes", "Timestamp"]); }

    const headers = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0];
    const stamp = new Date();
    const row = headers.map(h => {
      const key = String(h || "").trim().toLowerCase();
      if (!key) return "";
      if (key === "timestamp") return stamp;
      const sources = ALIASES[key] || [key];
      for (const s of sources) { if (data[s] !== undefined && data[s] !== "") return String(data[s]); }
      return "";
    });
    // if the tab has no Timestamp header, stamp the row at the end anyway
    if (!headers.some(h => String(h).trim().toLowerCase() === "timestamp")) row.push(stamp);

    sh.appendRow(row);
    notify_(data, tabName);
    return json_({ ok: true, tab: tabName });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// GET = health check. Open the /exec URL in a browser and you should see {"ok":true}
function doGet() { return json_({ ok: true, service: "HIGH - LVL DAILY intake" }); }

// Optional: email alert on every submission. Set NOTIFY_TO to "" to turn off.
const NOTIFY_TO = "19keys@19keys.com";
function notify_(data, tabName) {
  if (!NOTIFY_TO) return;
  const lines = Object.keys(data).filter(k => !["page"].includes(k)).map(k => k + ": " + data[k]).join("\n");
  try { MailApp.sendEmail(NOTIFY_TO, "HIGH - LVL DAILY · " + tabName, lines + "\n\n" + (data.page || "")); } catch (e) {}
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// Run this once from the editor to confirm the sheet and tabs are reachable (check the Execution log).
function selfTest() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  Object.values(TABS).forEach(t => Logger.log(t + " → " + (ss.getSheetByName(t) ? "found" : "MISSING")));
}
