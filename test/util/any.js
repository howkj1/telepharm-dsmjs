import Chance from 'chance'
import { times } from 'lodash'
const chance = new Chance(),
  str = ({
      length = 8,
      pool = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    } = {}) => chance.string({
      length,
      pool
    }),
  strings = (count = 3) => times(count, () => str()),
  name = (...args) => chance.name(...args),
  floating = (...args) => chance.floating(...args),
  bool = (...args) => chance.bool(...args),
  integer = (...args) => chance.integer(...args),
  id = () => Math.abs(integer()),
  gender = () => chance.gender(),
  firstName = (...args) => chance.first(...args),
  middleName = () => chance.first(),
  lastName = (...args) => chance.last(...args),
  birthday = () => chance.birthday({ string: true }),
  ssn = (...args) => chance.ssn(...args),
  prefix = (...args) => chance.prefix(...args),
  suffix = (...args) => chance.suffix(...args),
  email = (...args) => chance.email(...args),
  address = (...args) => chance.address(...args),
  city = (...args) => chance.city(...args),
  state = (...args) => chance.state(...args),
  zip = (...args) => chance.zip(...args),
  phone = (...args) => chance.phone(...args),
  password = str,
  any = {
    string: str,
    strings,
    name,
    floating,
    bool,
    integer,
    id,
    gender,
    firstName,
    middleName,
    lastName,
    birthday,
    date: birthday,
    ssn,
    prefix,
    suffix,
    email,
    password,
    address,
    city,
    state,
    zip,
    phone
  }

export default any

export {
  name as anyName,
  str as anyString,
  strings as anyStrings,
  floating as anyFloating,
  bool as anyBool,
  integer as anyInteger,
  id as anyId,
  gender as anyGender,
  firstName as anyFirstName,
  middleName as anyMiddleName,
  lastName as anyLastName,
  birthday as anyBirthday,
  birthday as anyDate,
  ssn as anySsn,
  prefix as anyPrefix,
  suffix as anySuffix,
  email as anyEmail,
  password as anyPassword,
  address as anyAddress,
  city as anyCity,
  state as anyState,
  zip as anyZip,
  phone as anyPhone
}