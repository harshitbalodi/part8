import { useMutation, useQuery } from "@apollo/client"
import { ALL_AUTHORS, EDIT_AUTHOR } from "../service/queries";
import { useState } from "react";

const Authors = (props) => {
  const result = useQuery(ALL_AUTHORS);
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [
      { query: ALL_AUTHORS }
    ]
  });

  const [name, setName] = useState("");
  const [year, setYear] = useState('');
  if (result.loading) return <div>fetch data...</div>
  console.log(result);

  if (!props.show) {
    return null
  }

  const authors = result.data.allAuthors;

  const handleSetBirth = (e) => {
    e.preventDefault();
    console.log(year);
    console.log(name);
    editAuthor({
      variables: {
        name,
        setBornTo: Number(year)
      }
    }).then(res => {
      console.log(res);
      setName('');
      setYear('');
    })

    console.log("set birth year is clicked");
  }

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>
        Set birthYear
      </h2>
      <form onSubmit={handleSetBirth}>
        <div>
          <label htmlFor="name">Author</label>
          <select
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          >
            {
              authors.map(a => {
               return <option key={a.value} value={a.name}>
                  {a.name}
                </option>
              })
            }
          </select>
        </div>
        <div>
          <label htmlFor="year">born</label>
          <input type="number" value={year} onChange={e => setYear(e.target.value)} id="year" required />
        </div>
        <button type="submit"> update author</button>
      </form>
    </div>
  )
}

export default Authors