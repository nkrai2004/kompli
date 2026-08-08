function toggleMenu(){document.getElementById("mainNav").classList.toggle("open")}
function calculate(){
  const people=Math.max(1,Number(document.getElementById("people").value)||0);
  const hourly=Math.max(1,Number(document.getElementById("hourly").value)||0);
  const hours=Math.round(people*0.5);
  const saving=Math.round(hours*hourly*0.366);
  document.getElementById("hours").textContent=hours+" hrs";
  document.getElementById("saving").textContent="₹"+saving.toLocaleString("en-IN");
}
function sendLead(e){
  e.preventDefault();
  const name=document.getElementById("name").value.trim();
  const email=document.getElementById("email").value.trim();
  const org=document.getElementById("org").value.trim();
  const sector=document.getElementById("sector").value;
  const size=document.getElementById("size").value;
  const message=document.getElementById("message").value.trim() || "Interested in a KOMPLI demo.";
  const text=`Hello KOMPLI, I would like to book a demo.%0A%0AName: ${encodeURIComponent(name)}%0AWork Email: ${encodeURIComponent(email)}%0AOrganization: ${encodeURIComponent(org)}%0ASector: ${encodeURIComponent(sector)}%0AOrganization Size: ${encodeURIComponent(size)}%0ARequirement: ${encodeURIComponent(message)}`;
  window.open(`https://wa.me/918745863882?text=${text}`,"_blank");
}
calculate();
