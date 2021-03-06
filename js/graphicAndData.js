var myData;
var frequencies = [];
var powers = [];
var count = 0;
var inicio;
var Chart = require("chart.js");

var ctx = document.getElementById("myChart").getContext("2d");
config = {
  type: 'line',
  data: {

    labels: frequencies,
    datasets: [{

      label: '# Spectrum',
      data: powers,
      backgroundColor: [
        'rgba(100, 221, 23, 0.2)'
      ],
      borderColor: [
        'rgba(0, 200, 83,1.0)'

      ],
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      yAxes: [{
        gridLines: {
          display: true,
          color: "#FFFFFF"
        },
        ticks: {
          fontColor: "white",
          beginAtZero: true
        }
      }],
      xAxes: [{
        gridLines: {
          display: true,
          color: '#FFFFFF'
        },
        ticks: {
          fontColor: "white"
        }
      }]
    },
    legend: {
      labels: {
        fontColor: "white"
      }
    }
  }
};

var myChart = new Chart(ctx, config);
var SerialPort = require("serialport");
const Readline = require('@serialport/parser-readline');
var port;

SerialPort.list(function (err, results) {
  if (err) {
    throw err;
  }
  let ports = results.map(x => x.comName)
  setTimeout(() => {
    let selectBox = document.getElementById("port");
    for (var i = 0, l = ports.length; i < l; i++) {
      selectBox.options.add(new Option(ports[i], ports[i]));
    }
  }, 500)
  // console.log(ports);
});

function clean(){
  powers = [];
  frequencies = [];
}

function startPort() {
  
  let e = document.getElementById("port");
  let strPort = e.options[e.selectedIndex].value
  port = new SerialPort(strPort, {
    baudRate: 9600,
  });
  const parser = new Readline();
  port.pipe(parser);
  parser.on('open', onOpen);
  parser.on('data', onData);
}

function stopPort() {
  port.close();
}

function onOpen() {
  console.log("Open connection");
}

function onData(data) {
  // Separa a a powers e frequecia
  myData = data.trim().split(";");
  let currentFrequency = myData[0];
  let currentPower = myData[1];
  let finitialValue = finitial.value;
  let ffinalValue = ffinal.value;
  // Controla o inicio da estação
  // O valor 88.00, estático será setado pelo usuário
  
  if (+currentFrequency == +finitialValue) {
    inicio = true;
  }
  // verifica se está con os dois valores e foi iniciado pela frequencies de inicio
  if (currentFrequency && currentPower && inicio) {
    frequencies[count] = currentFrequency;
    powers[count] = currentPower;
    count++;
  }
  // Zera a contagem
  if (+currentFrequency == +ffinalValue) {
    count = 0;
    inicio = false;
  }

 updateChart();
}

function updateChart(){
 // Recebe a potência setada
 myChart.data.datasets[0].data = powers;

 // Recebe a frequência setada
 myChart.data.labels = frequencies;

 // Atualiza os dados recebidos
 myChart.update();

}

// Carrega após os templates
(function () {

  function getBandwidth( fi, ff){
    return ff-fi
  }

  function getCentralFrequency( fi, ff){
    return fi + getBandwidth(fi, ff)/2;
  }

  function getInitialFrequency( fc, bw) {
    return fc - bw / 2
  }

  function getFinalFrequency( fc, bw) {
    return fc + bw / 2
  }

  setTimeout(function () {
    var FINITIAL = 87.5;
    var finitial = document.getElementById("finitial");
    finitial.value = FINITIAL;

    var FFINAL = 108;
    var ffinal = document.getElementById("ffinal");
    ffinal.value = FFINAL;

    var BANDWIDTH = getBandwidth(FINITIAL, FFINAL);
    var bandwidth = document.getElementById("bandwidth");
    bandwidth.value = BANDWIDTH;

    var FCENTRAL = getCentralFrequency(FINITIAL, FFINAL);
    var fcentral = document.getElementById("fcentral");
    fcentral.value = FCENTRAL;

    finitial.addEventListener("keypress", event => {
      if (event.keyCode === 13) {
        let finitialValue = new Number(event.target.value);
        let ffinalValue = new Number(ffinal.value);
        let bandwidthValue = getBandwidth(finitialValue, ffinalValue);

        bandwidth.value = bandwidthValue;
        fcentral.value = getCentralFrequency(finitialValue,ffinalValue);
        clean()
      }
    }, true);

    ffinal.addEventListener("keypress", event => {
      if (event.keyCode === 13) {
        let finitialValue = new Number(finitial.value);
        let ffinalValue = new Number(event.target.value);
        let bandwidthValue = getBandwidth(finitialValue, ffinalValue);

        bandwidth.value = bandwidthValue;
        fcentral.value = getCentralFrequency(finitialValue,ffinalValue);
        clean()
      }
    }, true);

    fcentral.addEventListener("keypress", event => {
      if (event.keyCode === 13) {
        let bandwidthValue = new Number(bandwidth.value);
        let fcentralValue = new Number(event.target.value);
        let displayFCentral = document.getElementById("displayFCentral")
        displayFCentral.textContent = event.target.value + " MHz";
        finitial.value = getInitialFrequency(fcentralValue, bandwidthValue);
        ffinal.value = getFinalFrequency(fcentralValue, bandwidthValue);
        clean()
      }
    }, true);

    bandwidth.addEventListener("keypress", event => {
      if (event.keyCode === 13) {
        let bandwidthValue = new Number(event.target.value);
        let fcentralValue = new Number(fcentral.value);
        let displayBandwith = document.getElementById("displayBandwith")
        finitial.value = getInitialFrequency(fcentralValue, bandwidthValue);
        ffinal.value = getFinalFrequency(fcentralValue, bandwidthValue);
        displayBandwith.textContent = bandwidthValue + " MHz";
        clean()
      }
    }, true);

  }, 500);

})();
