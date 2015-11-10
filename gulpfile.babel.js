import 'dotenv/config'
import gulp from 'gulp'
import { seedAsync } from './tasks/seed'
import open from 'open'
import Promise from 'bluebird'
import cmd from 'yargs'

gulp.task('seed', () => seedAsync())

gulp.task('open',
  () => open(`http://${process.env['DSM_URL']}:${process.env['DSM_PORT']}`)
)
