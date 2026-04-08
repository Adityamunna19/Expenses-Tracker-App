import { renderToString } from 'react-dom/server';
import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';

function TestChart() {
  const data = [{name: 'A', value: 400}];
  return React.createElement(PieChart, { width: 400, height: 400 }, 
    React.createElement(Pie, {
      data: data,
      cx: 200,
      cy: 200,
      innerRadius: 60,
      outerRadius: 80,
      fill: '#8884d8',
      dataKey: 'value'
    })
  );
}

try {
  const html = renderToString(React.createElement(TestChart));
  console.log('RENDER SUCCESS:', html.length > 0 ? html.substring(0, 100) + '...' : 'empty');
} catch (e) {
  console.error('RENDER ERROR:', e);
}