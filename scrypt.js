const qtyInputs = document.querySelectorAll('.qty');
const totalInput = document.getElementById('total');
const montantReductionInput = document.getElementById('montantReduction');
const totalFinalInput = document.getElementById('totalFinal');
const resultDiv = document.getElementById('result');
const discountButtons = document.querySelectorAll('.btn-discount');

let discountPercent = 0;

function calculerTotal() {
  let total = 0;
  qtyInputs.forEach((input) => {
    const price = parseFloat(input.dataset.price);
    const qty = parseInt(input.value) || 0;
    const subtotal = price * qty;
    input.closest('tr').querySelector('.subtotal').textContent = subtotal
      .toFixed(2)
      .replace('.', ',');
    total += subtotal;
  });
  totalInput.value = total.toFixed(2).replace('.', ',');
  return total;
}

function appliquerReduction(total, percent) {
  return total * (percent / 100);
}

function mettreAJourAffichage() {
  const total = calculerTotal();
  const reduction = appliquerReduction(total, discountPercent);
  const totalFinal = total - reduction;

  montantReductionInput.value = reduction.toFixed(2).replace('.', ',');
  totalFinalInput.value = totalFinal.toFixed(2).replace('.', ',');
}

qtyInputs.forEach((input) => {
  input.addEventListener('input', () => {
    mettreAJourAffichage();
    resultDiv.innerHTML = '';
  });
});

discountButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    discountPercent = parseInt(btn.dataset.discount);
    discountButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    mettreAJourAffichage();
    resultDiv.innerHTML = '';
  });
});

discountButtons[0].classList.add('active');
mettreAJourAffichage();

function genererTicket(
  civilite,
  prenom,
  nom,
  services,
  totalAvant,
  reduction,
  totalApres
) {
  const now = new Date();
  const dateHeure =
    now.toLocaleDateString('fr-FR') + ' ' + now.toLocaleTimeString('fr-FR');
  const client = civilite + ' ' + prenom + ' ' + nom;
  let ticket = `🧾 *Ticket - Pressing Sacré Coeur*\n📅 Date : ${dateHeure}\n👤 Client : ${client}\n\n🧺 *Services* :\n`;

  services.forEach((s) => {
    if (s.qty > 0) {
      ticket += `- ${s.name} x${s.qty} : ${s.subtotal
        .toFixed(2)
        .replace('.', ',')} €\n`;
    }
  });
  ticket += `\n💰 *Total avant réduction* : ${totalAvant
    .toFixed(2)
    .replace('.', ',')} €`;
  ticket += `\n🔖 Réduction : ${reduction.toFixed(2).replace('.', ',')} €`;
  ticket += `\n🟢 *Total à payer* : ${totalApres
    .toFixed(2)
    .replace('.', ',')} €\n\n`;
  ticket += 'Merci pour votre confiance ! 🙏';

  return ticket;
}

function genererLienWhatsApp(numero, message) {
  const messageEncode = encodeURIComponent(message);
  // On ajoute le +33 automatiquement si pas présent (France)
  let tel = numero.trim();
  if (!tel.startsWith('+') && tel.length >= 9) {
    tel = '33' + tel;
  }
  return `https://wa.me/${tel}?text=${messageEncode}`;
}

document.getElementById('btnGenerer').addEventListener('click', () => {
  const civilite = document.getElementById('civilite').value;
  const prenom = document.getElementById('prenom').value.trim();
  const nom = document.getElementById('nom').value.trim();
  const numero = document.getElementById('numero').value.trim();

  if (!civilite || !prenom || !nom || !numero) {
    alert('Veuillez remplir tous les champs obligatoires.');
    return;
  }

  const services = Array.from(qtyInputs).map((input) => {
    return {
      name: input.closest('tr').cells[0].textContent,
      qty: parseInt(input.value) || 0,
      price: parseFloat(input.dataset.price),
      subtotal: (parseInt(input.value) || 0) * parseFloat(input.dataset.price),
    };
  });

  const totalAvant = calculerTotal();
  const reduction = appliquerReduction(totalAvant, discountPercent);
  const totalApres = totalAvant - reduction;

  const ticket = genererTicket(
    civilite,
    prenom,
    nom,
    services,
    totalAvant,
    reduction,
    totalApres
  );
  const lienWhatsApp = genererLienWhatsApp(numero, ticket);

  // Afficher le ticket en clair + lien WhatsApp
  resultDiv.innerHTML = `
      <pre style="white-space: pre-wrap; background:#f9f9f9; padding:10px; border:1px solid #ddd; font-family: monospace;">
${ticket}
      </pre>
      <a class="btn" href="${lienWhatsApp}" target="_blank" rel="noopener noreferrer" style="display:inline-block; margin-top:10px;">
        Envoyer le ticket via WhatsApp
      </a>
    `;
});

// Fonction pour générer et télécharger le PDF
document.getElementById('download-pdf').addEventListener('click', () => {
  const civilite = document.getElementById('civilite').value;
  const prenom = document.getElementById('prenom').value.trim();
  const nom = document.getElementById('nom').value.trim();

  if (!civilite || !prenom || !nom) {
    alert(
      'Veuillez remplir Civilité, Prénom et Nom avant de télécharger le PDF.'
    );
    return;
  }

  const services = Array.from(qtyInputs).map((input) => {
    return {
      name: input.closest('tr').cells[0].textContent,
      qty: parseInt(input.value) || 0,
      price: parseFloat(input.dataset.price),
      subtotal: (parseInt(input.value) || 0) * parseFloat(input.dataset.price),
    };
  });

  const totalAvant = calculerTotal();
  const reduction = appliquerReduction(totalAvant, discountPercent);
  const totalApres = totalAvant - reduction;

  // Créer un élément temporaire HTML avec le contenu du ticket
  const ticketHtml = document.createElement('div');
  ticketHtml.style.fontFamily = 'Arial, sans-serif';
  ticketHtml.style.padding = '1em';
  ticketHtml.innerHTML = `
      <h2>Ticket Pressing Sacré Coeur</h2>
      <p><strong>Date :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
      <p><strong>Client :</strong> ${civilite} ${prenom} ${nom}</p>
      <table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color:#f4f4f4;">
            <th>Service</th>
            <th>Quantité</th>
            <th>Prix unitaire (€)</th>
            <th>Sous-total (€)</th>
          </tr>
        </thead>
        <tbody>
          ${services
            .map((s) =>
              s.qty > 0
                ? `<tr>
              <td>${s.name}</td>
              <td style="text-align:center;">${s.qty}</td>
              <td style="text-align:right;">${s.price
                .toFixed(2)
                .replace('.', ',')}</td>
              <td style="text-align:right;">${s.subtotal
                .toFixed(2)
                .replace('.', ',')}</td>
            </tr>`
                : ''
            )
            .join('')}
        </tbody>
      </table>
      <p><strong>Total avant réduction :</strong> ${totalAvant
        .toFixed(2)
        .replace('.', ',')} €</p>
      <p><strong>Réduction :</strong> ${reduction
        .toFixed(2)
        .replace('.', ',')} €</p>
      <p><strong>Total à payer :</strong> ${totalApres
        .toFixed(2)
        .replace('.', ',')} €</p>
      <p>Merci pour votre confiance ! 🙏</p>
    `;

  // Générer et télécharger le PDF
  html2pdf()
    .set({
      margin: 1,
      filename: `ticket_pressing_${prenom}_${nom}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' },
    })
    .from(ticketHtml)
    .save();
});
