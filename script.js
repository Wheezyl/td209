const geoAPI = "https://geo.api.gouv.fr/communes?codePostal=";
const weatherAPI = "https://api.meteo-concept.com/api/forecast/daily";
const token = "74bc07e4d8ee43ad4e23dc671385dc4d9675b7748c8f72a32d6d124715275abc";

// Chargement des communes en fonction du code postal
document.getElementById("postal-code").addEventListener("input", async function () {
  const code = this.value.trim();
  const communeSelect = document.getElementById("commune-select");
  communeSelect.innerHTML = "";

  if (/^\d{5}$/.test(code)) {
    try {
      const res = await fetch(`${geoAPI}${code}&fields=nom,code&format=json`);
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        communeSelect.innerHTML = "<option>Aucune commune trouvée</option>";
        return;
      }

      communeSelect.innerHTML = "<option value=''>-- Choisissez une commune --</option>";
      data.forEach(commune => {
        const opt = document.createElement("option");
        opt.value = commune.code; // Code INSEE
        opt.textContent = commune.nom;
        communeSelect.appendChild(opt);
      });
    } catch (error) {
      console.error("Erreur API Geo:", error);
      communeSelect.innerHTML = "<option>Erreur de chargement</option>";
    }
  } else {
    communeSelect.innerHTML = "<option>Veuillez entrer un code postal valide</option>";
  }
});

// Envoi du formulaire météo
document.getElementById("weather-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  const insee = document.getElementById("commune-select").value;
  const results = document.getElementById("results");
  results.innerHTML = "";

  if (!insee) {
    alert("Veuillez sélectionner une commune.");
    return;
  }

  try {
    const res = await fetch(`${weatherAPI}?token=${token}&insee=${insee}`);
    const forecast = await res.json();

    const todayForecast = forecast.forecast[0]; // Météo du jour (modifiable selon tes besoins)

    const card = document.createElement("div");
    card.className = "weather-card";

    const html = `
      <h3>${forecast.city.name} - Météo du jour</h3>
      <p>Temp. min : ${todayForecast.tmin} °C</p>
      <p>Temp. max : ${todayForecast.tmax} °C</p>
      <p>Probabilité de pluie : ${todayForecast.probarain}%</p>
      <p>Ensoleillement : ${todayForecast.sun_hours} h</p>
    `;

    card.innerHTML = html;
    results.appendChild(card);
  } catch (error) {
    console.error("Erreur API MétéoConcept:", error);
    results.innerHTML = "<p>Erreur de récupération des données météo.</p>";
  }
});
 
