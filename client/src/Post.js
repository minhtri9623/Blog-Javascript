import moment from "moment";
import { Link } from "react-router-dom";

export default function Post ({_id,title, content, summary, cover, createdAt, author}) {
    return (
        <div className="post">
            <div className="image">
                <Link to={`/post/${_id}`}>
                    <img src={'http://localhost:4000/' + cover}/>
                </Link>
            </div>
            <div className="texts">
                <Link to={`/post/${_id}`}>
                    <h2>{title}</h2>
                </Link>
                <p className="info">
                    <a className="author">{author.username}</a>
                    <time>{moment(createdAt).format('HH:mm DD-MM-YYYY')}</time>
                </p>
                <p className="summary">{summary}</p>
            </div>
      </div> 
    );
}