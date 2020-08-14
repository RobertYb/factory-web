import { join } from 'path'
import { Template } from 'fbi'
import * as ejs from 'ejs'
import Factory from '..'
import { formatName, capitalizeEveryWord, isValidObject } from 'fbi/lib/utils'
import SubTemplateReact from './react'

export default class TemplateFactory extends Template {
  id = 'factory-web'
  description = 'template for factory-web'
  path = 'templates'
  renderer = ejs.render
  templates = [new SubTemplateReact(this.factory)]

  constructor(public factory: Factory) {
    super()
  }

  protected async gathering() {
    this.data.project = await this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Input the factory name',
        initial({ enquirer }: any) {
          return 'factory-demo'
        },
        validate(value: any) {
          const name = formatName(value)
          return (name && true) || 'please input a valid factory name'
        }
      },
      {
        type: 'input',
        name: 'description',
        message: 'Input factory description',
        initial({ state }: any) {
          return `factory ${state.answers.name} description`
        }
      },
      {
        type: 'MultiSelect',
        name: 'features',
        message: `Choose features for your project:`,
        hint: '(Use <space> to select, <return> to submit)',
        choices: [{ name: 'typescript', value: true }],
        result(names: string[]) {
          return this.map(names)
        }
      },
      {
        type: 'list',
        name: 'commands',
        message: `Input comma-separated names of the commands to generate:`,
        initial: ['build'],
        result(names: any) {
          return [...new Set(formatName(names))].map((id: any) => ({
            id,
            capitalizedId: capitalizeEveryWord(id),
            alias: '',
            args: '',
            flags: '',
            description: ''
          }))
        }
      },
      {
        type: 'list',
        name: 'templates',
        message: `Input comma-separated names of the templates to generate:`,
        initial: ['default'],
        result(names: any) {
          return [...new Set(formatName(names))].map((id: any) => ({
            id,
            capitalizedId: capitalizeEveryWord(id),
            description: ''
          }))
        }
      }
    ] as any)

    this.data.project.nameCapitalized = capitalizeEveryWord(this.data.project.name)

    const { factory, project } = this.data
    this.spinner = this.createSpinner(`Creating project...`).start(
      `Creating ${this.style.bold.green(project.name)} via ${factory.id} from ${
        factory.template
      }...`
    )
  }

  protected async writing() {
    const { project } = this.data
    this.files = {
      copy: [
        '.editorconfig',
        '.prettierrc',
        '.gitignore',
        project.features.typescript ? 'tsconfig.json' : '',
        ...project.templates.map(({ id }: any) => ({
          from: 'templates/default',
          to: `templates/${id}`,
          options: {
            // Docs: https://github.com/jprichardson/node-fs-extra/blob/master/docs/copy.md#copysrc-dest-options-callback
            // - overwrite <boolean>: overwrite existing file or directory, default is true. Note that the copy operation will silently fail if you set this to false and the destination exists. Use the errorOnExist option to change this behavior.
            // - errorOnExist <boolean>: when overwrite is false and the destination exists, throw an error. Default is false.
            // - dereference <boolean>: dereference symlinks, default is false.
            // - preserveTimestamps <boolean>: When true, will set last modification and access times to the ones of the original source files. When false, timestamp behavior is OS-dependent. Default is false.
            // - filter <Function>: Function to filter copied files. Return true to include, false to exclude. Can also return a Promise that resolves to true or false (or pass in an async function).
            // filter: (from: string, to: string) => {
            //   console.log('filter:', { from, to })
            //   return true
            // }
          }
        }))
      ],
      render: [
        'package.json',
        '.fbi.config.js',
        'README.md',
        project.features.typescript ? 'src/index.ts' : 'lib/index.js',
        ...project.commands.map((data: any) => ({
          from: project.features.typescript ? 'src/command.ts' : 'lib/command.js',
          to: project.features.typescript
            ? `src/commands/${data.id}.ts`
            : `lib/commands/${data.id}.js`,
          data
        })),
        ...project.templates.map((data: any) => ({
          from: project.features.typescript ? 'src/template.ts' : 'lib/template.js',
          to: project.features.typescript
            ? `src/templates/${data.id}.ts`
            : `lib/templates/${data.id}.js`,
          data
        }))
      ],
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
  $ ${this.style.cyan('cd ' + project.name)}`)

    if (project.features.typescript) {
      console.log(`
  ${this.style.dim(`1. run the first compile`)}
  $ ${this.style.cyan('fbi build')}

  ${this.style.dim('2. link the factory to the store for testing')}
  $ ${this.style.cyan('fbi link')}

  ${this.style.dim('3. watching for file changes')}
  $ ${this.style.cyan('fbi watch')}

  ${this.style.dim('4. change some code and start testing')}
  ${this.style.dim('how to test?')}
  $ ${this.style.cyan('cd another/directory')}
  $ ${this.style.cyan('fbi list')} ${this.style.dim(
        `the factory "${project.name}" should be listed in the "available factories"`
      )}
  $ ${this.style.cyan(`fbi create`)} ${this.style.dim('select a template you just created')}

  ${this.style.dim('5. unlink the factory from the store after tested')}
  $ ${this.style.cyan('fbi unlink')}`)
    } else {
      console.log(`
  ${this.style.dim('1. link the factory to the store for testing')}
  $ ${this.style.cyan('fbi link')}

  ${this.style.dim('2. change some code and start testing')}
  ${this.style.dim('how to test?')}
  $ ${this.style.cyan('cd another/directory')}
  $ ${this.style.cyan('fbi list')} ${this.style.dim(
        `the factory "${project.name}" should be listed in the "available factories"`
      )}
  $ ${this.style.cyan(`fbi create`)} ${this.style.dim('select a template you just created')}

  ${this.style.dim('3. unlink the factory from the store after tested')}
  $ ${this.style.cyan('fbi unlink')}`)
    }
  }
}