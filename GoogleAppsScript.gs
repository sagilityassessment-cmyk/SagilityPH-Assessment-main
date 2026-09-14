/**
 * Google Apps Script backend for the Sagility assessment email form.
 *
 * Deploy as a Web app:
 *   Execute as: Me
 *   Who has access: Anyone with the link
 * Then paste the deployment URL into GOOGLE_SCRIPT_URL in index.html.
 */

const ADMIN_EMAIL = 'PHLTestAdmin@Sagilityhealth.com';
const MEETING_TIME = '11am-8pm MNL';
const MEETING_LINK = 'https://teams.microsoft.com/l/meetup-join/19%3ameeting_YWUyMzUzYzYtNTgxYS00ZWVhLWJjN2UtNTA4YWM2Mzg1Zjdk%40thread.v2/0?context=%7b%22Tid%22%3a%22c0745124-84a4-4909-bb95-307ad5a8ae15%22%2c%22Oid%22%3a%22e7eb26f1-7544-4bac-bfac-c4674034791e%22%7d';
const MEETING_ID = '479 656 747 406 7';
const MEETING_PASSCODE = 'vi3nV3NB';
const CANDIDATE_NOTIFICATION_URL = 'https://assessmentportal.sagilife.online/candidate.html';

function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    const candidateName = String(request.name || '').trim();
    const candidateEmail = String(request.email || '').trim();
    const location = String(request.location || '').trim();
    const packages = Array.isArray(request.packages) ? request.packages : [];
    const isRetake = request.isRetake === true;
    const isFollowUp = request.isFollowUp === true;

    if (!candidateName || !candidateEmail || !location || packages.length === 0) {
      return jsonResponse({ success: false, error: 'Name, email, location, and at least one package are required.' });
    }

    const subjectPrefix = isFollowUp
      ? 'Sagility Assessment Follow Up_'
      : isRetake ? 'Sagility Assessment Retake_' : 'Sagility Assessment_';
    const subject = `${subjectPrefix}${candidateName}_${location}`;
    const plainTextBody = buildPlainTextBody(candidateName, location, packages, isRetake, isFollowUp);
    const htmlBody = buildHtmlBody(candidateName, location, packages, isRetake, isFollowUp);

    MailApp.sendEmail({
      to: candidateEmail,
      subject: subject,
      body: plainTextBody,
      htmlBody: htmlBody,
      replyTo: ADMIN_EMAIL,
      name: 'SagilityPH Assessment'
    });

    return jsonResponse({ success: true });
  } catch (error) {
    return jsonResponse({ success: false, error: error.message });
  }
}

function buildPlainTextBody(candidateName, location, packages, isRetake, isFollowUp) {
  const packageLines = packages.map(item => `${item.name} - ${item.url}`).join('\n');
  const introduction = isFollowUp
    ? 'Good Day!\n\nI would like to follow up on your assessment completion. Kindly complete the assessments below at your earliest convenience:'
    : isRetake
    ? 'Sorry to inform you that you did not achieve the required assessment score(s) on one or more of the tests below. Please click the link(s) below to retake your assessment.'
    : 'Good Day!\n\nPlease click link/s below to start your assessment.';

  return `Hi ${candidateName},

${introduction}

${packageLines}

Note:
If you have completed your assessment, please click the link below to notify our Test Admin that you have finished your assessment.

Notification link: Click here - ${CANDIDATE_NOTIFICATION_URL}

Once notified, our Test Admin will review your assessment status and proceed with checking your results.

Before You Start:

We recommend using a laptop or desktop computer and a headset for the best experience. However, if a laptop or desktop computer is not available, you may use your mobile device to complete the assessment.
Make sure you are in a quiet environment.
Use your active email address and enter the security code when prompted.
Read all instructions carefully before taking the assessment.

Need Assistance?

If you need assistance, you may join our Virtual Assessment session so we can guide you on how to take your assessment or provide any necessary follow-ups.

Time: ${MEETING_TIME}
Link: ${MEETING_LINK}
Meeting ID: ${MEETING_ID}
Passcode: ${MEETING_PASSCODE}

Important Reminders:

⚠️ Use the assessment link only once.
🔒 Do not share or forward the link.
📍 The system records IP address and location.
📇 Assessment materials are confidential. Any misuse may affect your application.

For questions or assistance, please contact:
${ADMIN_EMAIL}

Thank you, and good luck with your assessment!

Best Regards,

Talent Acquisition- Sagility Recruitment - Test Admin
${location}`;
}

function buildHtmlBody(candidateName, location, packages, isRetake, isFollowUp) {
  const packageLinks = packages.map(item =>
    `<li><strong>${escapeHtml(item.name)}:</strong> <a href="${escapeAttribute(item.url)}">Click here</a></li>`
  ).join('');
  const introduction = isFollowUp
    ? '<p>I would like to follow up on your assessment completion. Kindly complete the assessments below at your earliest convenience:</p>'
    : isRetake
    ? '<p>Sorry to inform you that you did not achieve the required assessment score(s) on one or more of the tests below. Please click the link(s) below to retake your assessment.</p>'
    : '<p>Good Day!</p><p>Please click link/s below to start your assessment.</p>';

  return `<p>Hi ${escapeHtml(candidateName)},</p>
${introduction}
<ol>${packageLinks}</ol>
<h3 style="margin-top: 24px;">Note:</h3>
<p>If you have completed your assessment, please click the link below to notify our Test Admin that you have finished your assessment.</p>
<p><strong>Notify Test Admin:</strong> <a href="${escapeAttribute(CANDIDATE_NOTIFICATION_URL)}">Click here</a></p>
<p>Once notified, our Test Admin will review your assessment status and proceed with checking your results.</p>
<h3>Before You Start:</h3>
<ul>
<li>We recommend using a laptop or desktop computer and a headset for the best experience. However, if a laptop or desktop computer is not available, you may use your mobile device to complete the assessment.</li>
<li>Make sure you are in a quiet environment.</li>
<li>Use your active email address and enter the security code when prompted.</li>
<li>Read all instructions carefully before taking the assessment.</li>
</ul>
<h3>Need Assistance?</h3>
<p>If you need assistance, you may join our Virtual Assessment session so we can guide you on how to take your assessment or provide any necessary follow-ups.</p>
<p>Time: ${MEETING_TIME}<br>Link: <a href="${escapeAttribute(MEETING_LINK)}">Meeting Invite</a><br>Meeting ID: ${MEETING_ID}<br>Passcode: ${MEETING_PASSCODE}</p>
<h3>Important Reminders:</h3>
<ul>
<li>⚠️ Use the assessment link only once.</li>
<li>🔒 Do not share or forward the link.</li>
<li>📍 The system records IP address and location.</li>
<li>📇 Assessment materials are confidential. Any misuse may affect your application.</li>
</ul>
<p>For questions or assistance, please contact:<br><a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a></p>
<p>Thank you, and good luck with your assessment!</p>
<p><strong>Best Regards,<br>Talent Acquisition- Sagility Recruitment - Test Admin<br>${escapeHtml(location)}</strong></p>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

function escapeAttribute(value) {
  return escapeHtml(value).replace(/javascript:/gi, '');
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
