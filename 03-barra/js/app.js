// Selecciones
const graf = d3.select("#graf")

// Dimensiones
const anchoTotal = +graf.style("width").slice(0,-2)
const altoTotal = (anchoTotal * 9) / 16

const margins = {
  top: 20,
  right: 20,
  bottom: 75,
  left: 100
}

const ancho = anchoTotal - margins.left - margins.right
const alto = altoTotal - margins.top - margins.bottom

// Escaladores


// Elementos gráficos (layers)
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

const load = async () => {
  // Carga de datos
  data = await d3.csv("barras.csv", d3.autoType)
  //data.forEach((d) => {
  //  d.facturacion = +d.facturacion
  //  d.clientes = +d.clientes
  //})
  
  // Accessor
  const yAccessor = (d) => d.ganancia
  const xAccessor = (d) => d.tienda
  
  // Escaladores
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, yAccessor)])
    .range([alto, 0])
  
  const x = d3
    .scaleBand()
    .domain(d3.map(data, xAccessor))
    .range([0, ancho])
    .paddingOuter(0.2)
    .paddingInner(0.1)
  
  // Rectángulos (Elementos)
  const rect = g
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => x(xAccessor(d)))
    .attr("y", (d) => y(yAccessor(d)))
    .attr("width", x.bandwidth())
    .attr("height", (d) => alto - y(yAccessor(d)))
    .attr("fill", "#e9c46a")
  
  // Ejes

}

load()
