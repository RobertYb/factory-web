import { join } from 'path'
import * as ejs from 'ejs'
import { Template, utils } from 'fbi'

import Factory from '../index'
import { getNameAndDescriptionConfig } from './common'
import { MICRO_MAIN_FEATURE_ID, MICRO_TEMPLATE_ID, MICRO_SUB_FEATURE_ID } from '../const'

const { capitalizeEveryWord, isValidObject } = utils

export default class TemplateUmiQiankun extends Template {
  id = MICRO_TEMPLATE_ID
  description = 'template for micro front-end application'
  path = 'templates/micro'
  renderer = ejs.render
  templates = []

  constructor(public factory: Factory) {
    super()
  }

  protected async gathering(flags: Record<string, any>) {
    // 获取暂存的项目参数
    const defaultName = (this.data.project && this.data.project.name) || 'project-demo'
    const nameAndDescriptionConfig = getNameAndDescriptionConfig(defaultName)
    this.data.project = await this.prompt([
      {
        type: 'select',
        name: 'features',
        message: `Which feature of micro do you want to choice?`,
        hint: '(Use <arrow> to select, <return> to submit)',
        choices: [
          { name: MICRO_MAIN_FEATURE_ID, value: true },
          { name: MICRO_SUB_FEATURE_ID, value: true }
        ],
        result(name: string) {
          return {
            [name]: true
          }
        }
      } as any,
      ...nameAndDescriptionConfig
    ])
    let { factory, project } = this.data
    this.spinner = this.createSpinner(`Creating project...`).start(
      `Creating ${this.style.bold.green(project.name)} via ${factory.id} from ${
        factory.template
      }...`
    )
    project.nameCapitalized = capitalizeEveryWord(project.name)
    project = {
      ...project,
      templateId: MICRO_TEMPLATE_ID
    }
  }

  protected async writing() {
    const { main, sub } = this.data.project.features
    const mainFiles = main ? ['config/*', 'src/models/*', 'src/access.ts'] : []
    const subFiles = sub ? [] : []
    this.files = {
      copy: [
        '.vscode/*',
        'mock/*',
        'src/components/*',
        'src/config/*',
        'src/generated/*',
        'src/graphql/*',
        'src/pages/*',
        'src/Apollo.ts',
        '.eslintignore',
        '.eslintrc.js',
        '.gitignore',
        '.npmrc',
        '.prettierignore',
        '.prettierrc.js',
        '.stylelintrc.js',
        'codegen.yml',
        'graphql.schema.json',
        'package-lock.json',
        'yarn.lock',
        'tsconfig.json',
        '.editorconfig',
        'typings.d.ts',
        ...mainFiles,
        ...subFiles
      ],
      render: ['.fbi.config.js', 'package.json', 'src/app.tsx', '.umirc.ts', 'README.md', '.env'],
      renderOptions: {
        async: true
      }
    }
  }

  protected async installing(flags: Record<string, any>) {
    const { project } = this.data
    this.spinner.succeed(`Created project ${this.style.cyan.bold(project.name)}`)
    const { dependencies, devDependencies } = require(join(this.targetDir, 'package.json'))
    if (isValidObject(dependencies) || isValidObject(devDependencies)) {
      const installSpinner = this.createSpinner(`Installing dependencies...`).start()
      try {
        const packageManager = flags.packageManager || this.context.get('config').packageManager
        const cmds = packageManager === 'yarn' ? [packageManager] : [packageManager, 'install']
        this.debug(`\nrunning \`${cmds.join(' ')}\` in ${this.targetDir}`)
        await this.exec(cmds[0], cmds.slice(1), {
          cwd: this.targetDir
        })
        installSpinner.succeed(`Installed dependencies`)
      } catch (err) {
        installSpinner.fail('Failed to install dependencies. You can install them manually.')
        this.error(err)
      }
    }
  }

  protected async ending() {
    const { project } = this.data
    const projectName = this.style.cyan.bold(project.name)
    if (this.errors) {
      this.spinner.fail(`Failed to created project ${projectName}.`)
      this.error(this.errors)
    }

    console.log(`
Next steps:
  $ ${this.style.cyan('cd ' + project.name)}
  `)
    console.log(`
  $ ${this.style.cyan('fbi s')} ${this.style.dim('launch the serve')}`)

    console.log(`
  $ ${this.style.cyan('fbi b')} ${this.style.dim('build project')}`)

    console.log(`
  $ ${this.style.cyan('fbi list')} ${this.style.dim('show available commands and sub templates')}`)
  }
}
