
const aluminumElasticModulus = 70000.0;
document.getElementById("momentOfInertia").value = 297.3;
document.getElementById("modulus").value = 44.9;

// function minSectionModulus(beamLength, beamSpacing, load, yealdStress){
// 	let modulus = 0.215625 * ( load * beamSpacing ) * ( beamLength**2) / yealdStress;
// 	return modulus;
// }


function range(start, end) {
    if(start === end) return [start];
    return [start, ...range(start + 1, end)];
}

function mm3TOcm3(number) {
  number = Number(number);
	return number*0.001;
}

function Nxmm_to_kNxm(number) {
  return Number(number)*10**-6;
}

function AllowableDeflection(){
  let limit_select = document.getElementById('select');
  let limit = limit_select.value;
  let beamLenght = document.getElementById('length').value;
  return Number(beamLenght / limit); 
}

function ActualDeflection(){
  let load = (document.getElementById('load').value); // kN/m^2
  let beamSpacing = (document.getElementById('spacing').value); // mm
  let beamLenght = document.getElementById('length').value; // mm

  // const Ix_reinforce = 1121190;  // mm**4 per il tubo tipico in alu
  let Ix_beam = document.getElementById("momentOfInertia").value * 10**4; //mm**4
  // recupero il valore del select per il materiale del rinforzo
  let mat = document.getElementById('mat_rinforzo');

  let mat_value = mat.value.split("-"); // resituisce un vettore ["steel","S235","235","360"]
  console.log("materiale: ", mat_value[0])
  console.log("codifica: ", mat_value[1])
  console.log("snervamento: ", mat_value[2])
  console.log("rottura: ", mat_value[3])

  let mat_coeff = mat_value[0] == 'alu' ? 1.0 : 3.0; //document.getElementById("mat_coeff").value;
  console.log(mat_coeff)
  let Ix_reinforce = mat_coeff * document.getElementById("I_reinforce").value* 10**4; //mm**4
  Ix_beam = Ix_beam + Ix_reinforce;
  return (5/384) * (load * beamSpacing / 1000) * beamLenght**4 /(aluminumElasticModulus * Ix_beam);
}

function bendingMoment(gamma_force){
  let load =  document.getElementById('load').value;
  let beamLenght = document.getElementById('length').value/1000; // m
  let beamSpacing = document.getElementById('spacing').value/1000; // m
  return (1/8) * (gamma_force) * (load * beamSpacing) * beamLenght**2; 
}

function prof_moment_ratio(Iprof, Ireinf){ //inserire i valori di I non omegeneizzati
  let mat = document.getElementById('mat_rinforzo');
  let matType = mat.value.split("-")[0]; // resituisce un vettore ["steel","S235","235","360"]
  let coeff =  matType == 'alu' ? 1.0 : 3.0; 
  console.log("quotaparte di momento del profilo: ", coeff)
  return Iprof/(coeff*Ireinf+Iprof);
  }

function profileMomentCapacity(){
  const val = 6.10 ; //resistenza slu in kN*m second EC9 + NAD ITA
  return val
}

function reinfMomentCapacity(){
  let mat = document.getElementById('mat_rinforzo');
  let mat_value = mat.value.split("-");
  let yielding = Number(mat_value[2]);
  console.log("reinf yielding: ", yielding);
  let gamma_mat = mat_value[0] == 'steel' ? 1.10 : 1.15 ;
  let W_reinforce = document.getElementById("W_reinforce").value;
  return capacity = (yielding * W_reinforce / gamma_mat) * 10**-3 // UNIT kN*m
}

function check(limit, value){
    if (Number(value) <= Number(limit))
      return 'OK';
    else
      return 'NON soddisfatta!';
}

function sign(limit, value){
  let sign = Number(value) <= Number(limit) ? "<=" : ">" ;
  return sign;
}

// DEFINIZIONE FUNZIONI ONCLICK
calcola.onclick = function () {
  let Iprofile = document.getElementById("momentOfInertia").value * 10**4; //mm**4
  let Ireinf = document.getElementById("I_reinforce").value* 10**4;
  let moment = bendingMoment(1.5);
  let profileCapacity = profileMomentCapacity();
  let profileMoment = (prof_moment_ratio(Iprofile, Ireinf)*moment);

  let reinfCapacity = reinfMomentCapacity();
  let reinfMoment = (moment - profileMoment);

  let allowableDeflection = AllowableDeflection();
  let deflection = ActualDeflection();
  
  let sign1 = sign(allowableDeflection, deflection);    
  let check1 = check(allowableDeflection, deflection);

  let sign2 = sign(profileCapacity, profileMoment);
  let check2 = check(profileCapacity, profileMoment);

  let sign3 = sign(reinfCapacity, reinfMoment);
  let check3 = check(reinfCapacity, reinfMoment);

  // prepara la stringa di output
  let ouputString = `** Verifica della freccia ** ${check1}
                    freccia: ${deflection.toFixed(1)} mm 
                    freccia ammissibile: ${allowableDeflection.toFixed(1)} mm 

                    ** Verifica di resistenza del profilo ** ${check2}
                    ** Verifica di resistenza del rinforzo** ${check3}`;
  

  console.log(`** Verifica della freccia ** ${check1}
  freccia: ${deflection.toFixed(1)} mm 
  freccia ammissibile: ${allowableDeflection.toFixed(1)} mm
  freccia  ${sign1} freccia ammissibile  

  ** Verifica di resistenza del profilo ** ${check2}
  momento agente: ${profileMoment.toFixed(1)} kN*m
  momento resistente: ${profileCapacity.toFixed(1)} kN*m
  momento  ${sign2} momento resistente 

  ** Verifica di resistenza del rinforzo** ${check3}
  momento agente: ${reinfMoment.toFixed(1)} kN*m
  momento resistente: ${reinfCapacity.toFixed(1)} kN*m
  momento  ${sign3} momento resistente `)

  // stampa il risultato
  document.getElementById('report').innerText = ouputString;
  bendingMoment();
}

doc.onclick = function () {
  alert(`Lega Alluminio: EN AW 6060-T6 (fo = 140 MPa) 
Calcolo secondo Eurocodice 9
Controllare la freccia max`);
    }

help.onclick = function () {
  alert(`informazioni su come usare il software`);
    };