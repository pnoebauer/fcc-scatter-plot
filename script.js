const w = 900;
const h = 500;

const padding = 60;

const svg = d3
	.select('.svg-container')
	.append('svg')
	.attr('preserveAspectRatio', 'xMinY Min meet')
	.attr('viewBox', `0 0 ${w} ${h}`)
	.classed('svg-content', true)
	.style('background-color', '#fff');

const tooltip = d3
	.select('.svg-container')
	.append('div')
	.attr('id', 'tooltip')
	.style('opacity', 0);

svg
	.append('text')
	.attr('x', 450)
	.attr('y', 20)
	.attr('id', 'title')
	.style('text-anchor', 'middle')
	.style('font-size', 20)
	.text('Doping in Professional Bicycle Racing');

svg
	.append('text')
	.attr('x', 450)
	.attr('y', 40)
	.attr('id', 'subtitle')
	.style('text-anchor', 'middle')
	.style('font-size', 15)
	.text(`35 Fastest times up Alpe d'Huez`);

svg
	.append('text')
	.attr('x', -300)
	.attr('y', 15)
	.style('font-size', 16)
	.attr('transform', 'rotate(-90)')
	.text('Time in Minutes');

async function loadAndPlotData() {
	const res = await fetch(
		'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
	);
	// const dataS = await res.json();
	// const data = dataS.slice(0, 5);
	// console.log(dataS);

	const data = await res.json();

	const timeToDateObj = timeString => {
		const splitTime = timeString.split(':');
		return new Date(1000 * (Number(splitTime[0]) * 60 + Number(splitTime[1])));
	};

	const xScale = d3
		.scaleTime()
		// .domain(d3.extent(data, d => new Date(d.Year, 0)))
		.domain([
			new Date(d3.min(data, d => d.Year, 0) - 1, 0),
			new Date(d3.max(data, d => d.Year, 0) + 1, 0),
		])
		.range([padding, w - padding]);

	// console.log(d3.extenst(data, d => new Date(d.Year, 0)));

	const yScale = d3
		.scaleLinear()
		// .domain(d3.extent(data, d => timeToDateObj(d.Time)))
		.domain([
			d3.min(data, d => timeToDateObj(d.Time)) * 0.99,
			d3.max(data, d => timeToDateObj(d.Time)) * 1.01,
		])
		.range([h - padding, padding]);

	// console.log(d3.extent(data, d => timeToDateObj(d.Time)));

	svg
		.selectAll('circle')
		.data(data)
		.enter()
		.append('circle')
		.attr('cx', d => xScale(new Date(d.Year, 0)))
		.attr('cy', d => yScale(timeToDateObj(d.Time)))
		.attr('r', 5)
		.attr('fill', d => (d.Doping ? 'dodgerblue' : 'darkorange'))
		.attr('class', 'dot')
		.attr('data-xvalue', d => new Date(d.Year, 0))
		.attr('data-yvalue', d => timeToDateObj(d.Time))
		.on('mouseover', function (d, i) {
			d3.select(this).style('r', 8);
			// d3.select(this).style('fill', 'green');
			// console.log(d, i);
			tooltip.transition().duration(200).style('opacity', 0.9);
			tooltip
				// .html(`Name: ${i.Name}<br/>Year: ${i.Year}, Time: ${i.Time}<br/><br/>${i.Doping}`)
				.html(
					`Name: ${i.Name}<br/>Year: ${i.Year}, Time: ${i.Time} ${
						i.Doping.length && `<br/><br/>${i.Doping}`
					}`
				)
				.attr('data-year', new Date(i.Year, 0))
				// .style('left', d.pageX + 'px')
				.style('left', d.offsetX + 'px')
				.style('top', d.offsetY + 'px');
		})
		.on('mouseout', function (d, i) {
			// d3.select(this).style('fill', 'black');
			d3.select(this).style('r', 5);
			tooltip.transition().duration(500).style('opacity', 0);
		});

	const xAxis = d3
		.axisBottom(xScale)
		.tickFormat((date, i) => (i % 2 ? date.getFullYear() : '')); //not really needed anymore as css handles it

	svg
		.append('g')
		.attr('transform', `translate(0, ${h - padding})`)
		.attr('id', 'x-axis')
		.call(xAxis);

	const yAxis = d3
		.axisLeft(yScale)
		.tickFormat(
			(time, i) =>
				`${new Date(time)
					.getMinutes()
					.toLocaleString('en-US', {minimumIntegerDigits: 2})}:${new Date(time)
					.getSeconds()
					.toLocaleString('en-US', {minimumIntegerDigits: 2})}`
		);

	svg
		.append('g')
		.attr('transform', `translate(${padding}, 0)`)
		.attr('id', 'y-axis')
		.call(yAxis);

	svg.append('g').attr('id', 'legend');

	const legendLabelNoDoping = d3
		.select('#legend')
		.append('g')
		.attr('class', 'legend-label')
		.attr('transform', 'translate(800, 330)');

	legendLabelNoDoping
		.append('text')
		.style('font-size', 10)
		.style('text-anchor', 'end')
		.text('No doping allegations');

	legendLabelNoDoping
		.append('rect')
		.attr('height', 10)
		.attr('width', 10)
		.attr('fill', 'darkorange')
		.attr('x', 20)
		.attr('y', -8);

	const legendLabelDoping = d3
		.select('#legend')
		.append('g')
		.attr('class', 'legend-label')
		.attr('transform', 'translate(800, 350)');

	legendLabelDoping
		.append('text')
		.text('Riders with doping allegations')
		.style('font-size', 10)
		.style('text-anchor', 'end');

	legendLabelDoping
		.append('rect')
		.attr('height', 10)
		.attr('width', 10)
		.attr('fill', 'dodgerblue')
		.attr('x', 20)
		.attr('y', -8);
}

loadAndPlotData();
