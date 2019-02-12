#! /usr/bin/env node

const React = require('react');
const program = require('../../lib/bin/program');
const { renderToStaticMarkup } = require('react-dom/server');
const { writeFileSync, existsSync, mkdirSync } = require('fs');
const Main = require('../components/Main');
const Command = require('../components/Command');
const path = require('path');
const process = require('process');

const outputPath = 'docs/build';

function formatContent(id, title, content) {
  return `---
id: cli_${id}
title: ${title}
---

${content}
`;
}

function writeMd(id, title, content) {
  const data = formatContent(id, title, content);
  writeFileSync(path.resolve(outputPath, `cli_${id}.md`), data);
}

function makeSidebar(program) {
  const commands = program.commands.map(command => `cli_${command.name()}`)
  return { 
    'cli-api': {
      'commands': ['cli_main', ...commands]
    }
  };
}

function run() {
  if (!existsSync(outputPath)) {
    mkdirSync(outputPath);
  }

  const main = renderToStaticMarkup(React.createElement(Main, { program }));
  writeMd('main', 'zos', main);

  program.commands.forEach(command => {
    const content = renderToStaticMarkup(React.createElement(Command, { command }));
    writeMd(command.name(), command.name(), content);
  });

  const sidebar = makeSidebar(program);
  writeFileSync(path.resolve(outputPath, 'sidebars.json'), JSON.stringify(sidebar, null, 2));
}

run();
console.log(`Docs generated in ${process.cwd()}/${outputPath}`)
