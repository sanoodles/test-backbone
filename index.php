<?php
ini_set("display_errors", 1);
require("db-connection.php");

switch ($_SERVER['REQUEST_METHOD']) {

    // create
    case "POST":
        $d = json_decode(file_get_contents("php://input"));
        $q = "
            INSERT INTO articles (title, author, content, ord)
            VALUES ('" . $d->title . "', '" . $d->author . "', '" . $d->content . "', " . $d->ord . ")";
        pg_query($q);
        break;

    // read
    case "GET":
        $q = "SELECT id, title, author, content, ord FROM articles";
        $re = pg_query($q);
        $rows = array();
        while ($ro = pg_fetch_assoc($re)) {
            $rows[] = $ro;
        }
        echo json_encode($rows);
        break;

    // update
    case "PUT":
        $d = json_decode(file_get_contents("php://input"));
        $q = "UPDATE articles
                SET title = '" . $d->title . "',
                    author = '" . $d->author . "',
                    content = '" . $d->content . "'
                WHERE id = " . intval($d->id);
        pg_query($q);
        break;

    // delete
    case "DELETE":
        $idArticle = substr($_GET["handler"], 1);
        $q = "DELETE FROM articles WHERE id = " . intval($idArticle);
        pg_query($q);
        break;
}

?>
