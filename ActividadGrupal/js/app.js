// Selecciones
const metrica1 = d3.select("#filtro1")
const metrica2 = d3.select("#filtro2")

const margins = {
  top: 60,
  right: 20,
  bottom: 75,
  left: 100
}

// Formatos
//let format = d3.format("0,000");

// Filtros
const opciones1 = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022"]
const catEntidades = {
  "Total": "Total", "Aguascalientes": "Ags", "Baja California": "BC", "Baja California Sur": "BCS", "Campeche": "Camp", "Chiapas": "Chis", "Chihuahua": "Chih", "Ciudad de México": "CDMX", "Coahuila": "Coah", "Colima": "Col", "Durango": "Dur", "Guanajuato": "Gto", "Guerrero": "Gro", "Hidalgo": "Hgo", "Jalisco": "Jal", "México": "EdoMex", "Michoacán": "Mich", "Morelos": "Mor", "Nayarit": "Nay", "Nuevo León": "NL", "Oaxaca": "Oax", "Puebla": "Pue", "Querétaro": "Qro", "Quintana Roo": "QRoo", "San Luis Potosí": "SLP", "Sinaloa": "Sin", "Sonora": "Son", "Tabasco": "Tab", "Tamaulipas": "Tamps", "Tlaxcala": "Tlax", "Veracruz": "Ver", "Yucatán": "Yuc", "Zacatecas": "Zac"
}
const opciones2 = Object.keys(catEntidades)

metrica1
  .selectAll("option")
  .data(opciones1)
  .enter()
  .append("option")
  .attr("value", (d) => d)
  .text((d) => d)

metrica2
  .selectAll("option")
  .data(opciones2)
  .enter()
  .append("option")
  .attr("value", (d) => d)
  .text((d) => d)

// ---------------------------- Gráfica horizontal ----------------------------
const drawHorizontal = async (el, filtro, titGraf, variable1 = "2015", variable2 = "Total") => {
  // Selecciones
  const graf = d3.selectAll(el)

  // Dimensiones
  const anchoTotal = +graf.style("width").slice(0,-2)
  const altoTotal = anchoTotal //(anchoTotal * 9) / 16

  const ancho = anchoTotal - margins.left - margins.right
  const alto = altoTotal - margins.top - margins.bottom

  // Elementos gráficos (layers)
  d3.select(el).selectAll("svg").remove();
  const svg = graf
    .append("svg")
    .attr("width", anchoTotal)
    .attr("height", altoTotal)
    .attr("class", "graf")

  const layer = svg
    .append("g")
    .attr("transform", `translate(${margins.left}, ${margins.top})`)

  layer.append("rect").attr("height", alto).attr("width", ancho).attr("fill", "white")

  // Grupo con la gráfica principal
  const g = svg
    .append("g")
    .attr("transform", `translate(${margins.left}, ${margins.top})`)

  // Carga de datos
  data = await d3.csv("data/datasetGrafica" + el.slice(-1) + ".csv", d3.autoType)
  
  // Accessor
  const yAccessor = (d) => d["Variable"]
  
  // Escaladores
  const x = d3
    .scaleLinear()
    .range([0, ancho-60])
  
  const color = d3
    .scaleOrdinal()
    .domain(opciones1)
    .range(d3.schemeCategory10)
  
  const y = d3
    .scaleBand()
    .range([0, alto])
    .paddingOuter(0.2)
    .paddingInner(0.1)
  
  // Título
  const titulo = g
    .append("text")
    .attr("x", ancho / 2)
    .attr("y", -15)
    .classed("titulo", true)
  
  const etiquetas = g.append("g")

  // Ejes
  const xAxisGroup = g
    .append("g")
    .attr("transform", `translate(0, ${alto})`)
    .classed("axis", true)
  const yAxisGroup = g
    .append("g")
    .classed("axis", true)
  
  // Filtro
  let variable = filtro == 1 ? variable1 : catEntidades[variable2]
  
  // Accesores
  const xAccessor = (d) => d[variable]
  data.sort((a, b) => xAccessor(b) - xAccessor(a))

  // Escaladores
  x.domain([0, d3.max(data, xAccessor)])
  y.domain(d3.map(data, yAccessor))
  
  // Rectángulos (Elementos)
  const rect = g
    .selectAll("rect")
    .data(data, yAccessor)
  rect
    .enter()
    .append("rect")
    .attr("x", (d) => x(0))
    .attr("y", (d) => y(yAccessor(d)))
    .attr("width", 0)
    .attr("height", y.bandwidth())
    .attr("fill", "green")
    .merge(rect)
    .transition()
    .duration(2500)
    //.ease(d3.easeBounce)
    .attr("x", (d) => x(0))
    .attr("y", (d) => y(yAccessor(d)))
    .attr("width", (d) => x(xAccessor(d)))
    .attr("height", y.bandwidth())
    .attr("fill", color(variable))
    .attr("fill-opacity", "0.8")
  
  d3.selectAll("rect").on("mouseover", mouseover).on("mouseout", mouseout);
  
  const et = etiquetas
    .selectAll("text")
    .data(data)
  et
    .enter()
    .append("text")
    .attr("x", (d) => x(0))
    .attr("y", (d) => y(yAccessor(d)) + y.bandwidth()*0.75)
    .merge(et)
    .transition()
    .duration(2500)
    .attr("x", (d) => x(xAccessor(d)))
    .attr("y", (d) => y(yAccessor(d)) + y.bandwidth()*0.75)
    .text(xAccessor)
  
  // Títulos
  titulo.text(titGraf + (filtro == 1 ? variable : variable2))
  
  // Ejes
  const xAxis = d3.axisBottom(x).ticks(8)
  const yAxis = d3.axisLeft(y)
  xAxisGroup.transition().duration(2500).call(xAxis)
  yAxisGroup.transition().duration(2500).call(yAxis)

  // Eventos
  metrica1.on("change", (e) => {
    e.preventDefault()
    drawVertical(el = "#graf1", filtro = 1, titGraf = "Mes de más robo, ", variable1 = e.target.value, variable2 = metrica2.property("value"))
    drawHorizontal(el = "#graf3", filtro = 1, titGraf = "Entidad más violenta, ", variable1 = e.target.value, variable2 = metrica2.property("value"))
  })
  metrica2.on("change", (e) => {
    e.preventDefault()
    drawVertical(el = "#graf2", filtro = 2, titGraf = "Año más violento, ", variable1 = metrica1.property("value"), variable2 = e.target.value)
    drawVertical(el = "#graf4", filtro = 2, titGraf = "Los 8 delitos de mayor violencia, ", variable1 = metrica1.property("value"), variable2 = e.target.value)
  })

}

// ---------------------------- Gráfica vertical ----------------------------
const drawVertical = async (el, filtro, titGraf, variable1 = "2015", variable2 = "Total") => {
  // Selecciones
  const graf = d3.selectAll(el)

  // Dimensiones
  const anchoTotal = +graf.style("width").slice(0,-2)
  const altoTotal = (anchoTotal * 9) / 16

  const ancho = anchoTotal - margins.left - margins.right
  const alto = altoTotal - margins.top - margins.bottom

  // Elementos gráficos (layers)
  d3.select(el).selectAll("svg").remove();
  const svg = graf
    .append("svg")
    .attr("width", anchoTotal)
    .attr("height", altoTotal)
    .attr("class", "graf")

  const layer = svg
    .append("g")
    .attr("transform", `translate(${margins.left}, ${margins.top})`)

  layer.append("rect").attr("height", alto).attr("width", ancho).attr("fill", "white")

  // Grupo con la gráfica principal
  const g = svg
    .append("g")
    .attr("transform", `translate(${margins.left}, ${margins.top})`)

  // Carga de datos
  data = await d3.csv("data/datasetGrafica" + el.slice(-1) + ".csv", d3.autoType)
  
  // Accessor
  const xAccessor = (d) => d["Variable"]
  
  // Escaladores
  const y = d3
    .scaleLinear()
    .range([alto, 0])
  
  const color = d3
    .scaleOrdinal()
    .domain(opciones1)
    .range(d3.schemeCategory10)
  
  const x = d3
    .scaleBand()
    .range([0, ancho])
    .paddingOuter(0.2)
    .paddingInner(0.1)
  
  // Título
  const titulo = g
    .append("text")
    .attr("x", ancho / 2)
    .attr("y", -15)
    .classed("titulo", true)
  
  const etiquetas = g.append("g")

  // Ejes
  const xAxisGroup = g
    .append("g")
    .attr("transform", `translate(0, ${alto})`)
    .classed("axis", true)
  const yAxisGroup = g
    .append("g")
    .classed("axis", true)
  
  // Filtro
  let variable = filtro == 1 ? variable1 : catEntidades[variable2]

  // Accesores
  const yAccessor = (d) => d[variable]
  data.sort((a, b) => yAccessor(b) - yAccessor(a))

  // Escaladores
  y.domain([0, d3.max(data, yAccessor)])
  x.domain(d3.map(data, xAccessor))
  
  // Rectángulos (Elementos)
  const rect = g
    .selectAll("rect")
    .data(data, yAccessor)
  rect
    .enter()
    .append("rect")
    .attr("x", (d) => x(xAccessor(d)))
    .attr("y", (d) => y(0))
    .attr("width", x.bandwidth())
    .attr("height", 0)
    .attr("fill", "green")
    .merge(rect)
    .transition()
    .duration(2500)
    //.ease(d3.easeBounce)
    .attr("x", (d) => x(xAccessor(d)))
    .attr("y", (d) => y(yAccessor(d)))
    .attr("width", x.bandwidth())
    .attr("height", (d) => alto - y(yAccessor(d)))
    .attr("fill", color(variable))
    .attr("fill-opacity", "0.8")
  
  d3.selectAll("rect").on("mouseover", mouseover).on("mouseout", mouseout);
  
  const et = etiquetas
    .selectAll("text")
    .data(data)
  et
    .enter()
    .append("text")
    .attr("x", (d) => x(xAccessor(d)) + x.bandwidth() / 2)
    .attr("y", (d) => y(0))
    .merge(et)
    .transition()
    .duration(2500)
    .attr("x", (d) => x(xAccessor(d)) + x.bandwidth() / 2)
    .attr("y", (d) => y(yAccessor(d)))
    .text(yAccessor)
  
  // Títulos
  titulo.text(titGraf + (filtro == 1 ? variable : variable2))
  
  // Ejes
  const xAxis = d3.axisBottom(x).ticks(8)
  const yAxis = d3.axisLeft(y)
  xAxisGroup.transition().duration(2500).call(xAxis)
  yAxisGroup.transition().duration(2500).call(yAxis)


  // Eventos
  metrica1.on("change", (e) => {
    e.preventDefault()
    drawVertical(el = "#graf1", filtro = 1, titGraf = "Mes de más robo, ", variable1 = e.target.value, variable2 = metrica2.property("value"))
    drawHorizontal(el = "#graf3", filtro = 1, titGraf = "Entidad más violenta, ", variable1 = e.target.value, variable2 = metrica2.property("value"))
  })
  metrica2.on("change", (e) => {
    e.preventDefault()
    drawVertical(el = "#graf2", filtro = 2, titGraf = "Año más violento, ", variable1 = metrica1.property("value"), variable2 = e.target.value)
    drawVertical(el = "#graf4", filtro = 2, titGraf = "Los 8 delitos de mayor violencia, ", variable1 = metrica1.property("value"), variable2 = e.target.value)
  })
  
}

drawVertical(el = "#graf1", filtro = 1, titGraf = "Mes de más robo, ")
drawVertical(el = "#graf2", filtro = 2, titGraf = "Año más violento, ")
drawVertical(el = "#graf4", filtro = 2, titGraf = "Los 8 delitos de mayor violencia, ")
drawHorizontal(el = "#graf3", filtro = 1, titGraf = "Entidad más violenta, ")

d3.selectAll("rect").on("mouseover", mouseover).on("mouseout", mouseout);

function mouseover(){
  d3.select(this).attr("fill-opacity", 1);
}

function mouseout(){
  d3.select(this).attr("fill-opacity", 0.8);
}
