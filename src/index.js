function getCorsHeaders() {
  return {
    "Access-Control-Allow-Origin": "https://brantley-global.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    "Access-Control-Max-Age": "86400",
    "Content-Type": "application/json"
  };
}

// Helper to send JSON responses with CORS headers
function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: getCorsHeaders(),
  });
}

function escapeHtml(text = "") {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

async function sendEmail(params, env) {
  const toRecipients = [params.email, params.email2].filter(Boolean);
  const emailPayload = {
    sender: "admin@brantley-global.com",
    to: toRecipients.length > 0 ? toRecipients : ["admin@brantley-global.com"],
    bcc: toRecipients.length > 0 ? ["admin@brantley-global.com"] : [],
    reply_to: ["support@brantley-global.com"],
  };

  // Add attachments if present
  if (params.attachments && Array.isArray(params.attachments)) {
    emailPayload.attachments = params.attachments.map(att => ({
      filename: att.filename,
      content: att.content, // base64 encoded string
      content_type: att.content_type || undefined,
    }));
  }

  if (params.templateId) {
    emailPayload.template_id = params.templateId;
    emailPayload.template_data = params.templateData || {};
  } else if (params.templateType === "general") {
    // General inquiry email (existing)
    emailPayload.subject = params.from_subject || `Message from ${params.from_firstname} ${params.from_lastname || ""}`;
    emailPayload.html_body = `
      <p>${escapeHtml(params.message)}</p>
      <p>From: ${escapeHtml(params.from_firstname)} ${escapeHtml(params.from_lastname || "")} &lt;${escapeHtml(params.email)}&gt;</p>
    `;
    emailPayload.text_body = params.message;
  } else if (params.templateType === "transfer") {
    // Investment confirmation email template
    emailPayload.subject = `Transfer Confirmation for ${escapeHtml(params.from_firstname)} ${escapeHtml(params.from_lastname || "")} from BG Company!`;
    emailPayload.html_body = `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fa; padding:20px;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" style="width:100%; max-width:600px; background-color:#ffffff; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.05); font-family:'Segoe UI', Arial, sans-serif; color:#333;">
              
              <!-- Header Banner -->
              <tr>
                <td style="background-color:#969696; padding:20px 30px;">
                  <table width="100%">
                    <tr>
                      <td width="60" style="padding-right:15px;">
                        <img src="https://brantley-global.com/logo.png" alt="Brantley Global" style="max-width:60px; height:auto;" />
                      </td>
                      <td style="font-size:14px; color:#000000; font-weight:300;">
                        Secure Transfer of Your Digital Assets.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Title Section -->
              <tr>
                <td style="background-color:#f9fbfc; padding:20px;">
                  <h2 style="color:#000000; font-size:14px; margin:0; font-weight:lighter">TRANFER CONFIRMATION</h2>
                </td>
              </tr>

              <!-- Greeting and Summary -->
              <tr>
                <td style="padding:5px 30px;">
                  <p style="font-size:10px;">Hello ${escapeHtml(params.firstname || "")} ${escapeHtml(params.lastname || "")},</p>
                  <p style="font-size:10px;">Your transfer of <strong>${parseFloat(params.totalTokenAmount).toFixed(2)} ${escapeHtml(params.tokenSymbol)}</strong> was successful.</p>
                </td>
              </tr>

              <!-- Transaction Details -->
              <tr>
                <td style="background-color:#f9fbfc; padding:20px 30px;">
                  <h3 style="color:#000000; font-weight:lighter; margin-bottom:10px;">TRANSACTION DETAILS</h3>
                  <table width="100%" style="font-size:15px; line-height:1.6;">
                    <p style="font-size:16px;">Transferer Account: <strong>${escapeHtml(params.userAddress || "")}</strong>.</p>
                    <p style="font-size:16px;">Recipient Account: <strong>${escapeHtml(params.recipient || "")}</strong>.</p>
                  </table>
                </td>
              </tr>

              <!-- Closing Message -->
              <tr>
                <td style="padding:20px 30px;">
                  <p style="font-size:15px;">If you have any questions, feel free to reply to this email.</p>
                  <p style="font-size:15px;">Regards,<br/><strong>Brantley Global</strong></p>
                  <p style="font-size:8px;">There for you in ways you can not believe. Even when you believe otherwise.</p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color:#969696; padding:25px; text-align:center; font-size:13px; color:#000000;">
                  &copy; ${new Date().getFullYear()} Brantley Global<br />
                  <a href="https://brantley-global.com" style="color:#1E331E; text-decoration:none;">Visit Brantley Global</a>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    `;
      emailPayload.text_body = `Your transaction was successful. Transaction ID: ${params.receipt || ''}`;
  } else if (params.templateType === "investment") {
    // Investment confirmation email template
    emailPayload.subject = `Investment Confirmation for ${escapeHtml(params.from_firstname)} ${escapeHtml(params.from_lastname || "")} from BG Company!`;
    emailPayload.html_body = `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fa; padding:20px;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" style="width:100%; max-width:600px; background-color:#ffffff; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.05); font-family:'Segoe UI', Arial, sans-serif; color:#333;">
              
              <!-- Header Banner -->
              <tr>
                <td style="background-color:#969696; padding:20px 30px;">
                  <table width="100%">
                    <tr>
                      <td width="60" style="padding-right:15px;">
                        <img src="https://brantley-global.com/logo.png" alt="Brantley Global" style="max-width:60px; height:auto;" />
                      </td>
                      <td style="font-size:14px; color:#000000; font-weight:300;">
                        It Is Safe To Say You've Invested In You.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Title Section -->
              <tr>
                <td style="background-color:#f9fbfc; padding:20px;">
                  <h2 style="color:#000000; font-size:14px; margin:0; font-weight:lighter">INVESTMENT CONFIRMATION</h2>
                </td>
              </tr>

              <!-- Greeting and Summary -->
              <tr>
                <td style="padding:5px 30px;">
                  <p style="font-size:10px;">Hello ${escapeHtml(params.firstname || "")} ${escapeHtml(params.lastname || "")},</p>
                  <p style="font-size:10px;">Thank you for your investment of <strong>${parseFloat(params.totalTokenAmount).toFixed(2)} ${escapeHtml(params.tokenSymbol)}</strong>.</p>
                  <p style="font-size:10px;">Your investment will unlock <strong>${escapeHtml(params.unlockLabel || "the specified date")}</strong>.</p>
                  <p style="font-size:10px;">Eligibility Quarter: <strong>${escapeHtml(params.eligibilityLabel || "N/A")}</strong></p>
                  <p style="font-size:10px;">Multiplier Applied: <strong>${params.multiplier || "N/A"}%</strong></p>
                </td>
              </tr>

              <!-- Transaction Details -->
              <tr>
                <td style="background-color:#f9fbfc; padding:20px 30px;">
                  <h3 style="color:#000000; font-weight:lighter; margin-bottom:10px;">TRANSACTION DETAILS</h3>
                  <table width="100%" style="font-size:15px; line-height:1.6;">
                    ${params.committedQuarters > 9 ? `
                      <tr>
                        <td><strong>Selected Token:</strong></td>
                        <td>${escapeHtml(params.selectedTokenSymbol2)}</td>
                      </tr>
                    ` : ''}
                    <tr>
                    <tr><td><strong>User Wallet Address:</strong></td><td>${escapeHtml(params.userAddress)}</td></tr>
                    <tr><td><strong>Configuration:</strong></td><td>${escapeHtml(params.committedQuarters + " quarters")}</td></tr>
                    <tr><td><strong>User Receipt:</strong></td><td>${escapeHtml(params.receipt)}</td></tr>
                  </table>
                </td>
              </tr>

              <!-- Closing Message -->
              <tr>
                <td style="padding:20px 30px;">
                  <p style="font-size:15px;">Your support is appreciated. If you have any questions, feel free to reply to this email.</p>
                  <p style="font-size:15px;">Regards,<br/><strong>Brantley Global</strong></p>
                  <p style="font-size:8px;">There for you in ways you can not believe. Even when you believe otherwise.</p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color:#969696; padding:25px; text-align:center; font-size:13px; color:#000000;">
                  &copy; ${new Date().getFullYear()} Brantley Global<br />
                  <a href="https://brantley-global.com" style="color:#1E331E; text-decoration:none;">Visit Brantley Global</a>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    `;
    emailPayload.text_body = `Thank you for investing ${parseFloat(params.amount).toFixed(2)} ${escapeHtml(params.tokenSymbol)}. Investment unlocks on ${params.unlockLabel || "the specified date"}.`;

  }  else if (params.templateType === "acquisition") {
    // Investment confirmation email template
    emailPayload.subject = `Global Dollar Purchase Confirmation for ${escapeHtml(params.from_firstname)} ${escapeHtml(params.from_lastname || "")} from BG Company!`;
    emailPayload.html_body = `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fa; padding:20px;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" style="width:100%; max-width:600px; background-color:#ffffff; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.05); font-family:'Segoe UI', Arial, sans-serif; color:#333;">
              
              <!-- Header Banner -->
              <tr>
                <td style="background-color:#969696; padding:20px 30px;">
                  <table width="100%">
                    <tr>
                      <td width="60" style="padding-right:15px;">
                        <img src="https://brantley-global.com/logo.png" alt="Brantley Global" style="max-width:60px; height:auto;" />
                      </td>
                      <td style="font-size:14px; color:#000000; font-weight:300;">
                        A Purchase Into The Ecosystem Of The Future.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Title Section -->
              <tr>
                <td style="background-color:#f9fbfc; padding:20px;">
                  <h2 style="color:#000000; font-size:14px; margin:0; font-weight:lighter">PURCHASE CONFIRMATION</h2>
                </td>
              </tr>

              <!-- Greeting and Summary -->
              <tr>
                <td style="padding:5px 30px;">
                  <p style="font-size:10px;">Hello ${escapeHtml(params.firstname || "")} ${escapeHtml(params.lastname || "")},</p>
                  <p style="font-size:10px;">Payment Amount <strong>${parseFloat(params.totalTokenAmountIn).toFixed(2)} ${escapeHtml(params.tokenSymbol)}</strong>.</p>
                  <p style="font-size:10px;">Global Dollar Received <strong>${parseFloat(params.totalTokenAmountOut).toFixed(2)} GBDo</strong>.</p>
                </td>
              </tr>

              <!-- Transaction Details -->
              <tr>
                <td style="background-color:#f9fbfc; padding:20px 30px;">
                  <h3 style="color:#000000; font-weight:lighter; margin-bottom:10px;">TRANSACTION DETAILS</h3>
                  <table width="100%" style="font-size:15px; line-height:1.6;">
                    <tr><td><strong>User Wallet Address:</strong></td><td>${escapeHtml(params.userAddress)}</td></tr>
                    <tr><td><strong>User Receipt:</strong></td><td>${escapeHtml(params.receipt)}</td></tr>
                  </table>
                </td>
              </tr>

              <!-- Closing Message -->
              <tr>
                <td style="padding:20px 30px;">
                  <p style="font-size:15px;">Your support is appreciated. If you have any questions, feel free to reply to this email.</p>
                  <p style="font-size:15px;">Regards,<br/><strong>Brantley Global</strong></p>
                  <p style="font-size:8px;">There for you in ways you can not believe. Even when you believe otherwise.</p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color:#969696; padding:25px; text-align:center; font-size:13px; color:#000000;">
                  &copy; ${new Date().getFullYear()} Brantley Global<br />
                  <a href="https://brantley-global.com" style="color:#1E331E; text-decoration:none;">Visit Brantley Global</a>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    `;
    emailPayload.text_body = `Your purchase is appreciated.`;

  } else if (params.templateType === "redemption") {
    // Redemption confirmation email template
    emailPayload.subject = `Redemption Confirmation from BG Company!`;
    emailPayload.html_body = `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fa; padding:20px;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" style="width:100%; max-width:600px; background-color:#ffffff; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.05); font-family:'Segoe UI', Arial, sans-serif; color:#333;">
              
              <!-- Header Banner -->
              <tr>
                <td style="background-color:#969696; padding:20px 30px;">
                  <table width="100%">
                    <tr>
                      <td width="60" style="padding-right:15px;">
                        <img src="https://brantley-global.com/logo.png" alt="Brantley Global" style="max-width:60px; height:auto;" />
                      </td>
                      <td style="font-size:14px; color:#000000; font-weight:300;">
                        Your Reward For Your Faith.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Title Section -->
              <tr>
                <td style="background-color:#f9fbfc; padding:20px;">
                  <h2 style="color:#000000; font-size:14px; margin:0; font-weight:lighter">REDEMPTION CONFIRMATION</h2>
                </td>
              </tr>

              <!-- Greeting and Summary -->
              <tr>
                <td style="padding:5px 30px;">
                  <p style="font-size:10px;">Hello ${escapeHtml(params.firstname || "")} ${escapeHtml(params.lastname || "")},</p>
                  <p style="font-size:10px;">Thank you for your investment of <strong>${parseFloat(params.amount).toFixed(2)} ${escapeHtml(params.tokenSymbol)}</strong>.</p>
                  <p style="font-size:10px;">Your investment will unlock on <strong>${escapeHtml(params.unlockLabel || "the specified date")}</strong>.</p>
                  <p style="font-size:10px;">Eligibility Quarter: <strong>${escapeHtml(params.eligibilityLabel || "N/A")}</strong></p>
                  <p style="font-size:10px;">Multiplier Applied: <strong>${params.multiplier || "N/A"}%</strong></p>
                </td>
              </tr>

              <!-- Transaction Details -->
              <tr>
                <td style="background-color:#f9fbfc; padding:20px 30px;">
                  <h3 style="color:#000000; font-weight:lighter; margin-bottom:10px;">TRANSACTION DETAILS</h3>
                  <table width="100%" style="font-size:15px; line-height:1.6;">
                    <tr><td><strong>User Wallet Address:</strong></td><td>${escapeHtml(params.userAddress)}</td></tr>
                    <tr><td><strong>Configuration:</strong></td><td>${escapeHtml(params.committedQuarters + " quarters")}</td></tr>
                  </table>
                </td>
              </tr>

              <!-- Closing Message -->
              <tr>
                <td style="padding:20px 30px;">
                  <p style="font-size:15px;">Your support is appreciated. If you have any questions, feel free to reply to this email.</p>
                  <p style="font-size:15px;">Regards,<br/><strong>Brantley Global</strong></p>
                  <p style="font-size:8px;">There for you in ways you can not believe. Even when you believe otherwise.</p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color:#969696; padding:25px; text-align:center; font-size:13px; color:#000000;">
                  &copy; ${new Date().getFullYear()} Brantley Global<br />
                  <a href="https://brantley-global.com" style="color:#1E331E; text-decoration:none;">Visit Brantley Global</a>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    `;
    emailPayload.text_body = `Your redemption was successful. Transaction ID: ${params.receipt || ''}`;
  }  else if (params.templateType === "createSwap") {
    // Redemption confirmation email template
    emailPayload.subject = `AssetXchange Contract Creation Confirmation from BG Company!`;
    emailPayload.html_body = `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fa; padding:20px;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" style="width:100%; max-width:600px; background-color:#ffffff; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.05); font-family:'Segoe UI', Arial, sans-serif; color:#333;">
              
              <!-- Header Banner -->
              <tr>
                <td style="background-color:#969696; padding:20px 30px;">
                  <table width="100%">
                    <tr>
                      <td width="60" style="padding-right:15px;">
                        <img src="https://brantley-global.com/logo.png" alt="Brantley Global" style="max-width:60px; height:auto;" />
                      </td>
                      <td style="font-size:14px; color:#000000; font-weight:300;">
                        Liquidation On Demand.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Title Section -->
              <tr>
                <td style="background-color:#f9fbfc; padding:20px;">
                  <h2 style="color:#000000; font-size:14px; margin:0; font-weight:lighter">ASSETXCHANGE CREATION CONFIRMATION</h2>
                </td>
              </tr>

              <!-- Greeting and Summary -->
              <tr>
                <td style="padding:5px 30px;">
                  <p style="font-size:10px;">Hello ${escapeHtml(params.firstname || "")} ${escapeHtml(params.lastname || "")} and ${escapeHtml(params.firstname2 || "")} ${escapeHtml(params.lastname2 || "")},</p>
                  <p style="font-size:10px;">Your AssetXchange contract has been generated. To enter an AssetXchange contract or process a refund, you will need the Xchange ID. Please reference the following information to join the exchange or exit the exchange contract.</p>
                </td>
              </tr>

              <!-- Transaction Details -->
              <tr>
                <td style="background-color:#f9fbfc; padding:20px 30px;">
                  <h3 style="color:#000000; font-weight:lighter; margin-bottom:10px;">TRANSACTION DETAILS</h3>
                  <table width="100%" style="font-size:15px; line-height:1.6; border-collapse:collapse;">
                    <thead>
                      <tr>
                        <th style="padding:8px; border-bottom:1px solid #ccc;"></th>
                        <th style="padding:8px; border-bottom:1px solid #ccc;">Initiator</th>
                        <th style="padding:8px; border-bottom:1px solid #ccc;">Counter Party</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style="padding:8px;">Full Name</td>
                        <td style="padding:8px;">${escapeHtml(params.firstname || "")} ${escapeHtml(params.lastname || "")}</td>
                        <td style="padding:8px;">${escapeHtml(params.firstname2 || "")} ${escapeHtml(params.lastname2 || "")}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px;">Email</td>
                        <td style="padding:8px;">${escapeHtml(params.email || "")}</td>
                        <td style="padding:8px;">${escapeHtml(params.email2 || "")}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px;">Wallet Address</td>
                        <td style="padding:8px;">${escapeHtml(params.recipient || "")}</td>
                        <td style="padding:8px;">${escapeHtml(params.recipient2 || "")}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px;">Token/Asset</td>
                        <td style="padding:8px;">${escapeHtml(params.tokenSymbol || "")}</td>
                        <td style="padding:8px;">${escapeHtml(params.tokenSymbol2 || "")}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px;">Amount</td>
                        <td style="padding:8px;">${escapeHtml(params.totalTokenAmount || "")}</td>
                        <td style="padding:8px;">${escapeHtml(params.totalTokenAmount2 || "")}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px;">Service Token</td>
                        <td colspan="2" style="padding:8px;">${escapeHtml(params.serviceToken || "")}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px;">Exchange ID</td>
                        <td colspan="2" style="padding:8px;">${escapeHtml(params.xchangeId || "")}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <!-- Closing Message -->
              <tr>
                <td style="padding:20px 30px;">
                  <p style="font-size:15px;">If you have any questions, feel free to reply to this email.</p>
                  <p style="font-size:15px;">Regards,<br/><strong>Brantley Global</strong></p>
                  <p style="font-size:8px;">There for you in ways you can not believe. Even when you believe otherwise.</p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color:#969696; padding:25px; text-align:center; font-size:13px; color:#000000;">
                  &copy; ${new Date().getFullYear()} Brantley Global<br />
                  <a href="https://brantley-global.com" style="color:#1E331E; text-decoration:none;">Visit Brantley Global</a>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    `;
    emailPayload.text_body = `Your AssetXchange contract creation was successful. Transaction ID: ${params.receipt || ''}`;
  } else if (params.templateType === "joinSwap") {
    // Redemption confirmation email template
    emailPayload.subject = `AssetXchange Confirmation from BG Company!`;
    emailPayload.html_body = `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fa; padding:20px;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" style="width:100%; max-width:600px; background-color:#ffffff; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.05); font-family:'Segoe UI', Arial, sans-serif; color:#333;">
              
              <!-- Header Banner -->
              <tr>
                <td style="background-color:#969696; padding:20px 30px;">
                  <table width="100%">
                    <tr>
                      <td width="60" style="padding-right:15px;">
                        <img src="https://brantley-global.com/logo.png" alt="Brantley Global" style="max-width:60px; height:auto;" />
                      </td>
                      <td style="font-size:14px; color:#000000; font-weight:300;">
                        Liquidation On Demand.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Title Section -->
              <tr>
                <td style="background-color:#f9fbfc; padding:20px;">
                  <h2 style="color:#000000; font-size:14px; margin:0; font-weight:lighter">ASSETXCHANGE DEPOSIT CONFIRMATION</h2>
                </td>
              </tr>

              <!-- Greeting and Summary -->
              <tr>
                <td style="padding:5px 30px;">
                  <p style="font-size:10px;">Hello ${escapeHtml(params.firstname2 || "")} ${escapeHtml(params.lastname2 || "")}${escapeHtml(params.firstname2 || "")} ${escapeHtml(params.lastname2 || "")},</p>
                  <p style="font-size:10px;">Your AssetXchange deposit is complete. If the contract creator has not exited the contract your exchange is complete. If the exchange is not complete, please contact the contract creator before issuing a support request.</p>
                </td>
              </tr>

              <!-- Transaction Details -->
              <tr>
                <td style="background-color:#f9fbfc; padding:20px 30px;">
                  <h3 style="color:#000000; font-weight:lighter; margin-bottom:10px;">TRANSACTION DETAILS</h3>
                  <table width="100%" style="font-size:15px; line-height:1.6; border-collapse:collapse;">
                    <thead>
                      <tr>
                        <th style="padding:8px; border-bottom:1px solid #ccc;"></th>
                        <th style="padding:8px; border-bottom:1px solid #ccc;"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style="padding:8px;">Address</td>
                        <td style="padding:8px;">${escapeHtml(params.recipient || "")}${escapeHtml(params.recipient2 || "")}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px;">Token/Asset</td>
                        <td style="padding:8px;">${escapeHtml(params.tokenSymbol || "")}${escapeHtml(params.tokenSymbol2 || "")}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px;">Amount</td>
                        <td style="padding:8px;">${escapeHtml(params.totalTokenAmount || "")}${escapeHtml(params.totalTokenAmount2 || "")}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px;">Exchange ID</td>
                        <td colspan="2" style="padding:8px;">${escapeHtml(params.xchangeId || "")}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <!-- Closing Message -->
              <tr>
                <td style="padding:20px 30px;">
                  <p style="font-size:15px;">If you have any questions, feel free to reply to this email.</p>
                  <p style="font-size:15px;">Regards,<br/><strong>Brantley Global</strong></p>
                  <p style="font-size:8px;">There for you in ways you can not believe. Even when you believe otherwise.</p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color:#969696; padding:25px; text-align:center; font-size:13px; color:#000000;">
                  &copy; ${new Date().getFullYear()} Brantley Global<br />
                  <a href="https://brantley-global.com" style="color:#1E331E; text-decoration:none;">Visit Brantley Global</a>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    `;
    emailPayload.text_body = `Your AssetXchange commitment was successful. Transaction ID: ${params.receipt || ''}`;
  } else if (params.templateType === "refundSwap") {
    // Redemption confirmation email template
    emailPayload.subject = `AssetXchange Confirmation from BG Company!`;
    emailPayload.html_body = `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fa; padding:20px;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" style="width:100%; max-width:600px; background-color:#ffffff; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.05); font-family:'Segoe UI', Arial, sans-serif; color:#333;">
              
              <!-- Header Banner -->
              <tr>
                <td style="background-color:#969696; padding:20px 30px;">
                  <table width="100%">
                    <tr>
                      <td width="60" style="padding-right:15px;">
                        <img src="https://brantley-global.com/logo.png" alt="Brantley Global" style="max-width:60px; height:auto;" />
                      </td>
                      <td style="font-size:14px; color:#000000; font-weight:300;">
                        Flexibility & Protection Built In.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Title Section -->
              <tr>
                <td style="background-color:#f9fbfc; padding:20px;">
                  <h2 style="color:#000000; font-size:14px; margin:0; font-weight:lighter">ASSETXCHANGE REFUND CONFIRMATION</h2>
                </td>
              </tr>

              <!-- Greeting and Summary -->
              <tr>
                <td style="padding:5px 30px;">
                  <p style="font-size:10px;">Hello ${escapeHtml(params.firstname || "")} ${escapeHtml(params.lastname || "")} ${escapeHtml(params.firstname2 || "")} ${escapeHtml(params.lastname2 || "")},</p>
                  <p style="font-size:10px;">Your AssetXchange deposit is complete. If the contract creator has not exited the contract your exchange is complete. If the exchange is not complete, please contact the contract creator before issuing a support request.</p>
                </td>
              </tr>

              <!-- Transaction Details -->
              <tr>
                <td style="background-color:#f9fbfc; padding:20px 30px;">
                  <h3 style="color:#000000; font-weight:lighter; margin-bottom:10px;">TRANSACTION DETAILS</h3>
                  <table width="100%" style="font-size:15px; line-height:1.6; border-collapse:collapse;">
                    <thead>
                      <tr>
                        <th style="padding:8px; border-bottom:1px solid #ccc;"></th>
                        <th style="padding:8px; border-bottom:1px solid #ccc;"></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style="padding:8px;">Address</td>
                        <td style="padding:8px;">${escapeHtml(params.recipient || "")}${escapeHtml(params.recipient2 || "")}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px;">Token/Asset</td>
                        <td style="padding:8px;">${escapeHtml(params.tokenSymbol || "")}${escapeHtml(params.tokenSymbol2 || "")}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px;">Amount</td>
                        <td style="padding:8px;">${escapeHtml(params.totalTokenAmount || "")}${escapeHtml(params.totalTokenAmount2 || "")}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px;">Exchange ID</td>
                        <td colspan="2" style="padding:8px;">${escapeHtml(params.xchangeId || "")}</td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
              <!-- Closing Message -->
              <tr>
                <td style="padding:20px 30px;">
                  <p style="font-size:15px;">If you have any questions, feel free to reply to this email.</p>
                  <p style="font-size:15px;">Regards,<br/><strong>Brantley Global</strong></p>
                  <p style="font-size:8px;">There for you in ways you can not believe. Even when you believe otherwise.</p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color:#969696; padding:25px; text-align:center; font-size:13px; color:#000000;">
                  &copy; ${new Date().getFullYear()} Brantley Global<br />
                  <a href="https://brantley-global.com" style="color:#1E331E; text-decoration:none;">Visit Brantley Global</a>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    `;
    emailPayload.text_body = `Your AssetXchange refund was successful. Transaction ID: ${params.receipt || ''}`;
  } else {
    emailPayload.subject = `Purchase Confirmation for ${params.checkoutAsset?.name || ""} from BG Company!`;
    emailPayload.html_body = `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fa; padding:20px;">
        <tr>
          <td align="center">
            <table cellpadding="0" cellspacing="0" style="width:100%; max-width:600px; background-color:#ffffff; border-radius:10px; box-shadow:0 2px 8px rgba(0,0,0,0.05); font-family:'Segoe UI', Arial, sans-serif; color:#333;">
              <!-- Top Banner -->
              <tr>
                <td style="background-color:#969696; padding:20px 30px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <!-- Logo on the left -->
                      <td width="60" valign="middle" style="padding-right:15px;">
                        <img src="https://brantley-global.com/logo.png" alt="Brantley Global" style="max-width:60px; height:auto;" />
                      </td>

                      <!-- Text on the right -->
                      <td valign="middle" style="font-size:14px; color:#000000; font-weight:300;">
                        You've Helped Change The Future For The Better.
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Title Section with Soft Background -->
              <tr>
                <td style="background-color:#f9fbfc; padding:20px;">
                  <h2 style="color:#000000; font-size:14px; margin:0; font-weight:lighter">PURCHASE CONFIRMATION</h2>
                </td>
              </tr>

              <!-- Greeting and Summary -->
              <tr>
                <td style="padding:5px 30px;">
                  <p style="font-size:10px;">Hello ${escapeHtml(params.firstname || "")} ${escapeHtml(params.lastname || "")},</p>
                  <p style="font-size:10px;">Thank you for your purchase of <strong>${params.quantity} × ${escapeHtml(params.checkoutAsset?.name || "")}</strong>.</p>
                </td>
              </tr>

              <!-- Order Summary with Soft Background -->
              <tr>
                <td style="background-color:#f9fbfc; padding:20px 30px;">
                  <table width="100%" style="font-size:15px; line-height:1.6;">
                    <tr><td><strong>User Address:</strong></td><td>${params.userAddress || "N/A"}</td></tr>
                    <tr><td><strong>Transaction ID:</strong></td><td>${params.receipt || "N/A"}</td></tr>
                    <tr><td><strong>Payment Method:</strong></td><td>${params.tokenSymbol || "N/A"}</td></tr>
                    <tr><td><strong>Total Amount:</strong></td><td>${params.totalTokenAmount?.toString() || "N/A"}${params.tokenSymbol || "N/A"}</td></tr>
                    <tr><td><strong>Configuration:</strong></td><td>${params.configuration || "N/A"}</td></tr>
                  </table>
                </td>
              </tr>

              <!-- Shipping Info -->
              <tr>
                <td style="padding:20px 30px;">
                  <h3 style="color:#000000; font-weight:lighter">SHIPPING INFORMATION</h3>
                  <table width="100%" style="font-size:15px; line-height:1.6;">
                    <tr><td><strong>Address:</strong></td><td>${params.address || "N/A"}</td></tr>
                    <tr><td><strong>Phone:</strong></td><td>${params.phone || "N/A"}</td></tr>
                    <tr><td><strong>Country:</strong></td><td>${params.country || "N/A"}</td></tr>
                    <tr><td><strong>Postal Code:</strong></td><td>${params.postalCode || "N/A"}</td></tr>
                  </table>
                </td>
              </tr>

              <!-- Support Message -->
              <tr>
                <td style="padding:20px 30px;">
                  <p style="font-size:15px;">If you have any questions, reply to this email and include your transaction hash for faster support.</p>
                  <p style="font-size:15px;">We appreciate your business and look forward to serving you again.</p>
                  <p style="font-size:8px;">There for you in ways you can not believe. Even when you believe otherwise.</p>
                </td>
              </tr>

              <!-- Footer with Background -->
              <tr>
                <td style="background-color:#969696; padding:25px; text-align:center; font-size:13px; color:#000000;">
                  &copy; ${new Date().getFullYear()} Brantley Global<br />
                  <a href="https://brantley-global.com" style="color:#1E331E; text-decoration:none;">Visit Brantley Global</a>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    `;
    emailPayload.text_body = `Thank you for purchasing ${params.quantity} x ${params.checkoutAsset?.name}. Transaction hash: ${params.tx?.hash || ''}`;
  }

  const smtpResponse = await fetch("https://api.smtp2go.com/v3/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Smtp2go-Api-Key": env.SMTP2GO_API_KEY,
    },
    body: JSON.stringify(emailPayload),
  });

  const responseData = await smtpResponse.json();

  if (!smtpResponse.ok) {
    throw new Error(responseData.message || "Failed to send email");
  }

  return { message: "Email sent successfully" };
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(),
      });
    }

    try {
      const apiKey = request.headers.get("x-api-key");
      if (apiKey !== env.API_SECRET) {
        return jsonResponse({
          jsonrpc: "2.0",
          id: null,
          error: { code: -32600, message: "Unauthorized" }
        }, 401);
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return jsonResponse({
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: "Invalid JSON body" }
        }, 400);
      }

      const { method, params, id } = body;
      if (method !== "sendEmail") {
        return jsonResponse({
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: "Method not found" }
        }, 404);
      }

      let result;
      try {
        result = await sendEmail(params, env);
      } catch (err) {
        return jsonResponse({
          jsonrpc: "2.0",
          id,
          error: { code: -32001, message: err.message || "Email send failure" }
        }, 500);
      }

      return jsonResponse({
        jsonrpc: "2.0",
        id,
        result
      });

    } catch (error) {
      return jsonResponse({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32000, message: error.message || "Internal server error" }
      }, 500);
    }
  }
};
