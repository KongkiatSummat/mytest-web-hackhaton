const API_BASE = 'https://lingering-voice-8db3.kongkaet080.workers.dev';

const listEl = document.getElementById('appointments-list');
const showError = msg => listEl.innerHTML = `<div style="color:crimson">${msg}</div>`;

async function getAppointments(){
  try{
    const res = await fetch(`${API_BASE}/healthcare-appointments`);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderList(data);
  }catch(e){
    showError('Error loading appointments: ' + e.message);
  }
}

function renderList(items){
  if(!items || items.length === 0){
    listEl.innerHTML = '<div class="small">(no appointments)</div>';
    return;
  }
  listEl.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="flex"><strong>#${item.id}</strong>
        <div style="flex:1">
          <div><strong>${item.patient_name ?? ''}</strong> — <span class="small">${item.doctor_name ?? ''}</span></div>
          <div class="small">${item.appointment_date ?? ''}</div>
        </div>
        <div style="text-align:right">
          <button data-id="${item.id}" class="btn-edit">Edit</button>
          <button data-id="${item.id}" class="btn-delete">Delete</button>
        </div>  
      </div>
    `;
    listEl.appendChild(card);
  });

  document.querySelectorAll('.btn-edit').forEach(b => {
    b.onclick = e => {
      const id = e.target.dataset.id;
      document.getElementById('put-id').value = id;
      const item = items.find(it => String(it.id) === String(id));
      if(item){
        document.getElementById('put-name').value = item.patient_name || '';
        document.getElementById('put-doctor').value = item.doctor_name || '';
        const d = item.appointment_date ? new Date(item.appointment_date) : null;
        if(d && !isNaN(d)){
          const iso = d.toISOString();
          document.getElementById('put-date').value = iso.slice(0,16);
        }
      }
    }
  });

  document.querySelectorAll('.btn-delete').forEach(b => {
    b.onclick = async e => {
      const id = e.target.dataset.id;
      if(!confirm(`Delete appointment ${id}?`)) return;
      try{
        const res = await fetch(`${API_BASE}/healthcare-appointments/${id}`, { method: 'DELETE' });
        if(!res.ok) throw new Error(res.statusText || res.status);
        await getAppointments();
      }catch(err){
        alert('Delete failed: ' + err);
      }
    }
  });
}

// create (POST)
document.getElementById('btn-create').addEventListener('click', async ()=>{
  const payload = {
    appointment_id: Number(document.getElementById('input-id').value) || undefined,
    patient_name: document.getElementById('input-name').value,
    doctor_name: document.getElementById('input-doctor').value,
    appointment_date: (document.getElementById('input-date').value) ? (new Date(document.getElementById('input-date').value)).toISOString() : undefined
  };
  try{
    const res = await fetch(`${API_BASE}/healthcare-appointments`, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    await getAppointments();
  }catch(e){
    alert('Create failed: ' + e.message);
  }
});

// update (PUT)
document.getElementById('btn-put').addEventListener('click', async ()=>{
  const id = document.getElementById('put-id').value;
  if(!id){ alert('Provide id'); return; }
  const payload = {
    patient_name: document.getElementById('put-name').value,
    doctor_name: document.getElementById('put-doctor').value,
    appointment_date: (document.getElementById('put-date').value) ? (new Date(document.getElementById('put-date').value)).toISOString() : undefined
  };
  try{
    const res = await fetch(`${API_BASE}/healthcare-appointments/${id}`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    });
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    await getAppointments();
  }catch(e){
    alert('Update failed: ' + e.message);
  }
});

// initial load
getAppointments();
