import { useState } from 'react'
import './App.css'
import { CreatePollForm } from './components/create-poll-form';
import { Polls } from './components/polls';
import useSignalR from "./useSignalR";

function App() {
    const [showCreatePoll, setShowCreatePoll] = useState(false);
    const { connection } = useSignalR("/r/voteHub");


  return (
      <div className="">
          <h1>Pollhouse</h1>
          <div>
              <div className="max-w-md mx-auto bg-gray-200 p-6 rounded-md shadow-md my-5">
                  <h2 className="text-lg font-semibold mb-4">
                      Create Poll
                  </h2>
                  <button onClick={(() => { setShowCreatePoll(!showCreatePoll) })}>
                      {showCreatePoll ? "-" : "v"}
                  </button>
                  <div className="mt-5" hidden={showCreatePoll ? false : true }>
                      {<CreatePollForm />}
                  </div>
              </div>
              <div>
                  <h2 className="text-lg font-semibold mb-4">
                      Polls
                  </h2>
                  <div>
                      <Polls connection={connection} />
                  </div>
              </div>
          </div>
      </div>
  )
}

export default App
