import { useState, useEffect } from 'react'
import personService from './services/persons'

const Person = (props) => {
  if (props.name.toLowerCase().includes(props.filter.toLowerCase())) {
    return (
      <p>
        {props.name} {props.number}
        <button onClick={() => props.onclick(props.id, props.name)}>Delete</button>
      </p>
    )
  }
}

const Filter = (props) => {
  return (
    <>
      Filter by name:
      <input
        value={props.value}
        onChange={props.handleFilterChange}
      />
    </>
  )
}

const Persons = ({ persons, filter, onclick }) => {
  return (
    <>
      {persons.map(person =>
        <Person onclick={onclick} id={person.id} filter={filter} name={person.name} number={person.number} key={person.name} />
      )}
    </>
  );
};

const Notification = ({ errorMessage, successMessage }) => {
  if (errorMessage === null && successMessage === null) {
    return null
  } else if (errorMessage === null) {
    return (
      <div className="success">
        {successMessage}
      </div>
    )
  }
  return (
    <div className="error">
      {errorMessage}
    </div>
  )
}

const PersonForm = (props) => {
  return (
    <form onSubmit={props.onSubmit}>
      <div>
        Name:
        <input
          value={props.valueName}
          onChange={props.onNameChange}
        />
      </div>
      <div>
        Number:
        <input
          value={props.valueNumber}
          onChange={props.onNumberChange}
        />
      </div>
      <div>
        <button type="submit">Add</button>
      </div>
    </form>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])

  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const hook = () => {
    personService
      .getAll()
      .then(savedPersons => {
        setPersons(savedPersons)
      })
  }

  useEffect(hook, [])

  const addName = (event) => {
    event.preventDefault()
    const foundPerson = persons.find(person => person.name === newName)

    if (!foundPerson) {
      const nameObject = {
        name: newName,
        number: newNumber
      }

      personService
        .addPerson(nameObject)
        .then(addedPerson => {
          setPersons(persons.concat(addedPerson))
          setNewName('')
          setNewNumber('')
          setSuccessMessage(
            `${addedPerson.name} was successfully added.`
          )
          setTimeout(() => {
            setSuccessMessage(null)
          }, 5000)
        })

    } else {
      let answer = window.confirm(`${foundPerson.name} already exists in the phonebook. Do you want to change their number?`)
      if (answer === true) {
        const updatedPerson = { ...foundPerson, number: newNumber }
        personService
          .changeNumber(foundPerson.id, updatedPerson)
          .then(changedPerson => {
            setPersons(persons.map(person => person.id !== foundPerson.id ? person : changedPerson))
            setNewName('')
            setNewNumber('')
            setSuccessMe`${changedPerson.name}'s number could not be changed.`
            ssage(
              `${changedPerson.name}'s number was successfully changed.`
            )
            setTimeout(() => {
              setSuccessMessage(null)
            }, 5000)
          })
          .catch(error => {
            setErrorMessage(
              `${updatedPerson.name}'s number could not be changed as they have already been removed.`
            )
            setTimeout(() => {
              setSuccessMessage(null)
            }, 5000)
            setPersons(persons.filter(person => person.name !== newName))
          })
      }
    }
  }

  const deletePerson = (id, name) => {
    let result = window.confirm(`Are you sure you want to delete ${name}?`)
    if (result === true) {
      personService
        .deletePerson(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id));
          setSuccessMessage(
            `${name} was successfully deleted of the phonebook.`
          )
          setTimeout(() => {
            setSuccessMessage(null)
          }, 5000)
        })
    } else {
      console.log('Poisto peruttu')
    }
  }

  return (
    <div>
      <h1>Phonebook</h1>
      <Notification errorMessage={errorMessage} successMessage={successMessage} />
      <Filter value={filter} handleFilterChange={(event) => setFilter(event.target.value)} />

      <h2>Add a new</h2>
      <PersonForm
        onSubmit={addName}
        valueNumber={newNumber}
        valueName={newName}
        onNumberChange={(event => setNewNumber(event.target.value))}
        onNameChange={(event => setNewName(event.target.value))}
      />

      <h2>Numbers</h2>
      <Persons filter={filter} persons={persons} onclick={deletePerson} />
    </div>
  )

}

export default App