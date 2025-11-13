import { useParams } from "react-router-dom";
import Messanger from "../components/chat/Messanger";
import Header from "../components/Header";

const Dashboard = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="min-h-screen w-full">
      <Header />
      <Messanger initialChatId={id || null} />
    </div>
  );
};

export default Dashboard;