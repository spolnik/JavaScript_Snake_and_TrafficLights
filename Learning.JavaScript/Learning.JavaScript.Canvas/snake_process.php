<?php
require_once('FirePHPCore/FirePHP.class.php');
ob_start();
$firephp = FirePHP::getInstance(true);

require_once 'snake_db.php';

$firephp->log('scripts start');

$firephp->log('insert_score starts');
	$action = strip_tags(trim($_POST['action']));
	$firephp->log($action, 'action');

	if ($action == 'process')
	{
		$name = strip_tags(trim($_POST['name']));
		$firephp->log($name, 'name');
	
		$score = intval(strip_tags(trim($_POST['score'])));
		$firephp->log($score, 'score');

		$query = "INSERT INTO scores (Name, Score) VALUES('$name','$score');";
		$firephp->log($query, 'query');

		mysql_query($query);
	
		$firephp->log('insert_score ends');
	}

$firephp->log('display_high_scores starts');

	$query = mysql_query('SELECT Name, Score FROM scores Order By Score DESC, ID ASC');
    $highscore = '';

	$i = 1; 

    while ($row = mysql_fetch_array($query))
    {
		if ($i < 4)
			$highscore .= '<tr class="bestScore"><td>'.$i.'</td>';
		else
			$highscore .= '<tr><td>'.$i.'</td>';

		$highscore .= '<td>'.$row['Name'].'</td>';

		if($i == 17)
			$highscore .= '<td id="lastScore">'.$row['Score'].'</td></tr>';
		else 
			$highscore .= '<td>'.$row['Score'].'</td></tr>';
		
	
		if ($i == 17)
			break;

		$i++;
    }
	
	$firephp->log($highscore, 'highscore');
	$firephp->log('display_high_scores ends');

    echo $highscore;

?>