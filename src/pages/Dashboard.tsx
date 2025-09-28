import Chat from "../components/chat/Chat";
import Header from "../components/Header";
import CodeEditor from "../components/IDE/CodeEditor";

const Dashboard = () => {


  return (
    <div className="min-h-screen w-full">
      <Header />
      <Chat chatId="general" />
      <CodeEditor />
    </div>
  );
};

export default Dashboard;