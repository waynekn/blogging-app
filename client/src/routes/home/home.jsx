import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import MessageToast from "../../components/toast/toast.component";
import { AuthError } from "../../api-requests/request-errors/errors";
import { AxiosError } from "axios";
import {
  clearCurrentUser,
  setCurrentUserNotificationMessage,
} from "../../store/user/user.slice";
import { selectCurrentUser } from "../../store/user/user.selector";
import { checkAuthStatus } from "../../api-requests/requests";
const Home = () => {
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  useEffect(() => {
    const getAuthStatus = async () => {
      try {
        await checkAuthStatus();
      } catch (error) {
        if (error instanceof AuthError) {
          dispatch(clearCurrentUser());
        } else if (error instanceof AxiosError) {
          dispatch(setCurrentUserNotificationMessage("Network error"));
        } else {
          dispatch(
            setCurrentUserNotificationMessage(
              "Unknown error. Please try again after a while"
            )
          );
        }
      }
    };
    getAuthStatus();
  }, [dispatch]);

  return (
    <>
      <h1>Welcome to ScribbleSpot</h1>
      <p> Explore in Beta</p>
      {currentUser.notificationMessage && (
        <MessageToast message={currentUser.notificationMessage} />
      )}
    </>
  );
};
export default Home;
